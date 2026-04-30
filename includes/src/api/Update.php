<?php

namespace Grootmade\api;

use Grootmade\{Constants, Helper};

class Update extends ApiBase
{
	public function list(\WP_REST_Request $request)
	{
		return Helper::get_item_updates();
	}

	public function endpoints()
	{
		return [
			'read' => [
				'callback' => [$this, 'list'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'read/settings' => [
				'callback' => [$this, 'get_setting'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'create' => [
				'callback' => [$this, 'create_autoupdate'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'update' => [
				'callback' => [$this, 'update_autoupdate'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'delete' => [
				'callback' => [$this, 'delete_autoupdate'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'list' => [
				'callback' => [$this, 'list'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'setting/get' => [
				'callback' => [$this, 'get_setting'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'update-autoupdate' => [
				'callback' => [$this, 'update_autoupdate'],
				'permission_callback' => [$this, 'user_can_install'],
			],
		];
	}
	public function get_setting(\WP_REST_Request $request)
	{
		$settings = get_option(Constants::AUTOUPDATE_SETTING_KEY, [
			'plugin' => [],
			'theme' => [],
		]);
		return [
			'plugin' =>
				isset($settings['plugin']) && is_array($settings['plugin'])
					? array_values($settings['plugin'])
					: [],
			'theme' =>
				isset($settings['theme']) && is_array($settings['theme'])
					? array_values($settings['theme'])
					: [],
		];
	}

	public function update_autoupdate(\WP_REST_Request $request)
	{
		return $this->persist_autoupdate(
			$request->get_param('type'),
			$request->get_param('slug'),
			$request->get_param('enabled'),
		);
	}

	public function create_autoupdate(\WP_REST_Request $request)
	{
		return $this->persist_autoupdate(
			$request->get_param('type'),
			$request->get_param('slug'),
			true,
		);
	}

	public function delete_autoupdate(\WP_REST_Request $request)
	{
		return $this->persist_autoupdate(
			$request->get_param('type'),
			$request->get_param('slug'),
			false,
		);
	}

	private function persist_autoupdate($type, $slug, $enabled)
	{
		$types = ['theme', 'plugin'];
		if (!in_array($type, $types)) {
			return new \WP_Error(400, 'Error enabling auto-update');
		}
		$setting = get_option(Constants::AUTOUPDATE_SETTING_KEY, []);
		if (!isset($setting[$type])) {
			$setting[$type] = [];
		}
		if ($enabled) {
			$setting[$type] = array_unique(
				array_merge(
					array_filter($setting[$type], function ($item) {
						return is_string($item);
					}),
					[$slug],
				),
			);
		} else {
			$setting[$type] = array_unique(
				array_filter($setting[$type], function ($item) use ($slug) {
					return $item !== $slug;
				}),
			);
		}
		update_option(Constants::AUTOUPDATE_SETTING_KEY, $setting);
		return [
			'message' => __('Success', 'grootmade'),
		];
	}
}
