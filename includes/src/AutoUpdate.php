<?php

namespace Grootmade;

use Grootmade\exceptions\ItemDetailErrorException;
use Grootmade\exceptions\ItemDownloadDetailException;

class AutoUpdate
{
	/**
	 * @var	static $instance
	 */
	private static $instance = null;

	public function __construct()
	{
		add_action('init', [$this, 'schedule_action']);
		add_action('init', [$this, 'schedule_pending_check']);
		add_action(Constants::SLUG . '/autoupdate', [
			$this,
			'autoupdate_check',
		]);
		add_action(
			Constants::SLUG . '/autoupdate/item',
			[$this, 'autoupdate_item'],
			10,
			2,
		);
		add_action(Constants::SLUG . '/pending-installs', [
			$this,
			'check_pending_installs',
		]);
		add_action(
			Constants::SLUG . '/pending-install/item',
			[$this, 'execute_pending_action'],
			10,
			4,
		);
		add_filter('cron_schedules', [$this, 'add_cron_intervals']);
	}

	public function autoupdate_check()
	{
		$activation_detail = Helper::get_activation_detail();
		if ($activation_detail === false) {
			return null;
		}
		if (
			isset($activation_detail['install_allowed']) &&
			$activation_detail['install_allowed'] === false
		) {
			return null;
		}
		if (
			isset($activation_detail['autoupdate']) &&
			$activation_detail['autoupdate'] !== true
		) {
			return null;
		}
		$settings = get_option(
			Constants::SETTING_KEY,
			Constants::DEFAULT_SETTINGS,
		);
		if (!isset($settings['autoupdate_day_of_week'])) {
			$days = [0, 1, 2, 3, 4, 5, 6, 7];
		} else {
			$days = $settings['autoupdate_day_of_week'];
		}
		$today_day = date('w');
		if (!in_array($today_day, $days, false)) {
			// no autoupdate enabled for today, so skip
			return null;
		}
		$enabled_items = get_option(Constants::AUTOUPDATE_SETTING_KEY);
		$engine_data = Helper::get_item_updates();
		if (!is_wp_error($engine_data)) {
			foreach ($engine_data['data'] as $item) {
				if (
					isset($enabled_items[$item['type']]) &&
					is_array($enabled_items[$item['type']]) &&
					in_array($item['slug'], $enabled_items[$item['type']])
				) {
					if (
						version_compare(
							$item['version'],
							$item['installed_version'],
							'gt',
						) === true
					) {
						wp_schedule_single_event(
							time(),
							Constants::SLUG . '/autoupdate/item',
							[$item['id'], $item['slug']],
						);
					}
				}
			}
		}
	}
	public function autoupdate_item($item_id, $slug = null)
	{
		$activation_detail = Helper::get_activation_detail();
		if ($activation_detail === false) {
			return;
		}
		if (
			isset($activation_detail['install_allowed']) &&
			$activation_detail['install_allowed'] === false
		) {
			return;
		}
		if (
			isset($activation_detail['autoupdate']) &&
			$activation_detail['autoupdate'] !== true
		) {
			return;
		}

		try {
			$item_detail = Helper::engine_post('item/detail', [
				'item_id' => $item_id,
			]);
			if (is_wp_error($item_detail)) {
				throw new ItemDetailErrorException($item_id);
			}
			$download_detail = Helper::engine_post('item/download', [
				'item_id' => $item_id,
				'method' => 'update',
			]);
			if (is_wp_error($download_detail)) {
				throw new ItemDownloadDetailException($item_id);
			}
			if ('template-kit' === $item_detail['type']) {
				return false;
			}
			$installer = new Installer($item_detail, $download_detail, $slug);
			$installer->run();
			return true;
		} catch (\Exception $e) {
			throw new \Exception($e->getMessage());
		}
	}
	/**
	 * @return self
	 */
	public static function get_instance()
	{
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register custom cron intervals.
	 */
	public function add_cron_intervals($schedules)
	{
		$schedules['five_minutes'] = [
			'interval' => 300,
			'display' => __('Every 5 Minutes', 'grootmade'),
		];
		return $schedules;
	}

	/**
	 * Schedule the pending installs check every 5 minutes.
	 */
	public function schedule_pending_check()
	{
		if (
			false === wp_next_scheduled(Constants::SLUG . '/pending-installs')
		) {
			wp_schedule_event(
				time(),
				'five_minutes',
				Constants::SLUG . '/pending-installs',
			);
		}
	}

	/**
	 * Check for pending remote installs from the engine.
	 */
	public function check_pending_installs()
	{
		$activation_detail = Helper::get_activation_detail();
		if ($activation_detail === false) {
			update_option(Constants::SLUG . '_pending_installs_last_check', [
				'time' => time(),
				'count' => 0,
				'error' => 'No activation detail',
			]);
			return 0;
		}
		if (
			isset($activation_detail['install_allowed']) &&
			$activation_detail['install_allowed'] === false
		) {
			update_option(Constants::SLUG . '_pending_installs_last_check', [
				'time' => time(),
				'count' => 0,
				'error' => 'Install not allowed',
			]);
			return 0;
		}

		$pending = Helper::engine_post('pending-install/list');
		if (is_wp_error($pending) || empty($pending['data'])) {
			update_option(Constants::SLUG . '_pending_installs_last_check', [
				'time' => time(),
				'count' => 0,
			]);
			return 0;
		}

		$count = count($pending['data']);
		foreach ($pending['data'] as $item) {
			wp_schedule_single_event(
				time(),
				Constants::SLUG . '/pending-install/item',
				[
					$item['item_id'],
					$item['pending_install_id'],
					$item['action'] ?? 'install',
					$item['slug'] ?? '',
				],
			);
		}

		update_option(Constants::SLUG . '_pending_installs_last_check', [
			'time' => time(),
			'count' => $count,
		]);
		return $count;
	}

	/**
	 * Execute a pending action (install, update, or uninstall) from the remote queue.
	 *
	 * @param int $item_id
	 * @param int $pending_install_id
	 * @param string $action install|update|uninstall
	 * @param string $slug item slug for non-marketplace items
	 */
	public function execute_pending_action(
		$item_id,
		$pending_install_id,
		$action = 'install',
		$slug = '',
	) {
		$activation_detail = Helper::get_activation_detail();
		if ($activation_detail === false) {
			return;
		}
		if (
			isset($activation_detail['install_allowed']) &&
			$activation_detail['install_allowed'] === false
		) {
			return;
		}

		try {
			if ($action === 'uninstall') {
				return $this->uninstall_item(
					$item_id,
					$pending_install_id,
					$slug,
				);
			}

			// install and update both use the Installer (which overwrites existing files)
			$item_detail = Helper::engine_post('item/detail', [
				'item_id' => $item_id,
			]);
			if (is_wp_error($item_detail)) {
				throw new ItemDetailErrorException($item_id);
			}
			$download_detail = Helper::engine_post('item/download', [
				'item_id' => $item_id,
				'method' => $action === 'update' ? 'update' : 'install',
			]);
			if (is_wp_error($download_detail)) {
				throw new ItemDownloadDetailException($item_id);
			}
			if ('template-kit' === $item_detail['type']) {
				Helper::engine_post('pending-install/complete', [
					'pending_install_id' => $pending_install_id,
					'status' => 'failed',
					'error_message' =>
						'Template kits cannot be remotely installed',
				]);
				return false;
			}
			$installer = new Installer($item_detail, $download_detail);
			$status = $installer->run();

			if (is_wp_error($status)) {
				Helper::engine_post('pending-install/complete', [
					'pending_install_id' => $pending_install_id,
					'status' => 'failed',
					'error_message' => $status->get_error_message(),
				]);
				return false;
			}

			// Auto-activate plugins if setting enabled (only for install action)
			if ($action === 'install') {
				$settings = get_option(
					Constants::SETTING_KEY,
					Constants::DEFAULT_SETTINGS,
				);
				if (
					$item_detail['type'] === 'plugin' &&
					isset($settings['autoactivate']) &&
					$settings['autoactivate']
				) {
					try {
						$installed_items = Helper::get_item_updates();
						if (
							!is_wp_error($installed_items) &&
							isset($installed_items['data'])
						) {
							$matched = \array_filter(
								$installed_items['data'],
								function ($_item) use ($item_id) {
									return $_item['id'] == $item_id;
								},
							);
							if (!empty($matched)) {
								$item = array_shift($matched);
								\activate_plugin($item['path']);
							}
						}
					} catch (\Exception $e) {
						error_log($e->getMessage());
					}
				}
			}

			Helper::engine_post('pending-install/complete', [
				'pending_install_id' => $pending_install_id,
				'status' => 'completed',
			]);
			return true;
		} catch (\Exception $e) {
			Helper::engine_post('pending-install/complete', [
				'pending_install_id' => $pending_install_id,
				'status' => 'failed',
				'error_message' => $e->getMessage(),
			]);
			return false;
		}
	}

	/**
	 * Uninstall a plugin or theme by item_id or slug.
	 *
	 * @param int $item_id
	 * @param int $pending_install_id
	 * @param string $slug item slug for non-marketplace items
	 */
	private function uninstall_item($item_id, $pending_install_id, $slug = '')
	{
		try {
			$item = null;

			// First try matching by item_id from the marketplace updates list
			if ($item_id) {
				$installed_items = Helper::get_item_updates();
				if (
					!is_wp_error($installed_items) &&
					!empty($installed_items['data'])
				) {
					$matched = \array_filter(
						$installed_items['data'],
						function ($_item) use ($item_id) {
							return $_item['id'] == $item_id;
						},
					);
					if (!empty($matched)) {
						$item = array_shift($matched);
					}
				}
			}

			// Fallback: match by slug against all installed plugins/themes
			if (!$item && $slug) {
				if (!function_exists('get_plugins')) {
					require_once ABSPATH . 'wp-admin/includes/plugin.php';
				}
				$all_plugins = get_plugins();
				foreach ($all_plugins as $plugin_path => $plugin_data) {
					$plugin_slug = dirname($plugin_path);
					if ($plugin_slug === '.') {
						$plugin_slug = basename($plugin_path, '.php');
					}
					if ($plugin_slug === $slug) {
						$item = [
							'type' => 'plugin',
							'slug' => $plugin_slug,
							'path' => $plugin_path,
						];
						break;
					}
				}

				if (!$item) {
					$theme = wp_get_theme($slug);
					if ($theme->exists()) {
						$item = [
							'type' => 'theme',
							'slug' => $slug,
						];
					}
				}
			}

			if (!$item) {
				Helper::engine_post('pending-install/complete', [
					'pending_install_id' => $pending_install_id,
					'status' => 'failed',
					'error_message' => 'Item not found on this site',
				]);
				return false;
			}

			if ($item['type'] === 'plugin') {
				// Deactivate first, then delete
				if (is_plugin_active($item['path'])) {
					deactivate_plugins($item['path']);
				}
				$result = delete_plugins([$item['path']]);
			} elseif ($item['type'] === 'theme') {
				// Cannot delete the active theme
				$active_theme = wp_get_theme();
				if ($active_theme->get_stylesheet() === $item['slug']) {
					Helper::engine_post('pending-install/complete', [
						'pending_install_id' => $pending_install_id,
						'status' => 'failed',
						'error_message' =>
							'Cannot uninstall the active theme. Switch themes first.',
					]);
					return false;
				}
				$result = delete_theme($item['slug']);
			} else {
				Helper::engine_post('pending-install/complete', [
					'pending_install_id' => $pending_install_id,
					'status' => 'failed',
					'error_message' =>
						'Unsupported item type for uninstall: ' . $item['type'],
				]);
				return false;
			}

			if (is_wp_error($result)) {
				Helper::engine_post('pending-install/complete', [
					'pending_install_id' => $pending_install_id,
					'status' => 'failed',
					'error_message' => $result->get_error_message(),
				]);
				return false;
			}

			Helper::engine_post('pending-install/complete', [
				'pending_install_id' => $pending_install_id,
				'status' => 'completed',
			]);
			return true;
		} catch (\Exception $e) {
			Helper::engine_post('pending-install/complete', [
				'pending_install_id' => $pending_install_id,
				'status' => 'failed',
				'error_message' => $e->getMessage(),
			]);
			return false;
		}
	}

	public function schedule_action()
	{
		if (false === wp_next_scheduled(Constants::SLUG . '/autoupdate')) {
			$settings = get_option(
				Constants::SETTING_KEY,
				Constants::DEFAULT_SETTINGS,
			);
			if (
				isset($settings['autoupdate']) &&
				$settings['autoupdate'] === true
			) {
				wp_schedule_event(
					time(),
					'daily',
					Constants::SLUG . '/autoupdate',
				);
			}
		}
	}
}
