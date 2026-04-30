<?php

namespace Grootmade\api;

use Grootmade\{Constants, Helper, Installer};

class Item extends ApiBase
{
	public function categories(\WP_REST_Request $request)
	{
		$type = $request->get_param('type');
		return Helper::engine_post('item/categories', [
			'type' => $type,
		]);
	}
	public function terms(\WP_REST_Request $request)
	{
		$type = $request->get_param('type');
		$cursor = $request->get_param('cursor');
		return Helper::engine_post('item/paginated-terms', [
			'type' => $type,
			'cursor' => $cursor,
		]);
	}

	public function changelog(\WP_REST_Request $request)
	{
		$page = $request->get_param('page');
		$item_id = $request->get_param('item_id');
		return Helper::engine_post('item/changelog', [
			'item_id' => $item_id,
			'page' => $page ?? 1,
		]);
	}

	public function demo_content(\WP_REST_Request $request)
	{
		$page = $request->get_param('page');
		$item_id = $request->get_param('item_id');
		return Helper::engine_post('item/demo-content', [
			'item_id' => $item_id,
			'page' => $page ?? 1,
		]);
	}

	public function detail(\WP_REST_Request $request)
	{
		$item_id = $request->get_param('item_id');

		return Helper::engine_post('item/detail', [
			'item_id' => $item_id,
		]);
	}
	public function get_comments(\WP_REST_Request $request)
	{
		$item_id = (int) $request->get_param('item_id');
		$topic_id = (int) $request->get_param('topic_id');
		if ($item_id <= 0 || $topic_id <= 0) {
			return new \WP_Error(
				400,
				__('Invalid comment request payload', 'grootmade'),
			);
		}

		$discourse_response = wp_remote_get(
			'https://meta.grootmade.com/t/' . $topic_id . '.json',
			[
				'timeout' => 15,
				'headers' => ['Accept' => 'application/json'],
			],
		);

		if (
			is_wp_error($discourse_response) ||
			(int) wp_remote_retrieve_response_code($discourse_response) !== 200
		) {
			return new \WP_Error(
				400,
				__('Error fetching comments', 'grootmade'),
			);
		}

		$body = json_decode(wp_remote_retrieve_body($discourse_response), true);
		if (!is_array($body)) {
			return new \WP_Error(
				400,
				__('Invalid comments response', 'grootmade'),
			);
		}

		// Attach canonical topic URL so the frontend can resolve relative avatar paths.
		$body['url'] =
			'https://meta.grootmade.com/t/' .
			($body['slug'] ?? $topic_id) .
			'/' .
			$topic_id;

		return $body;
	}
	public function download_additional(\WP_REST_Request $request)
	{
		$item_id = $request->get_param('item_id');
		$media_id = $request->get_param('media_id');
		$item_detail = Helper::engine_post('item/detail', [
			'item_id' => $item_id,
		]);
		if (is_wp_error($item_detail)) {
			return new \WP_Error(
				400,
				__('Error getting Item detail', 'grootmade'),
			);
		}
		return Helper::engine_post('item/download-additional', [
			'item_id' => $item_id,
			'media_id' => $media_id,
		]);
	}
	public function endpoints()
	{
		return [
			'read/list' => [
				'callback' => [$this, 'items'],
			],
			'read/detail' => [
				'callback' => [$this, 'detail'],
			],
			'read/stats' => [
				'callback' => [$this, 'stats'],
			],
			'create' => [
				'callback' => [$this, 'install'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'update' => [
				'callback' => [$this, 'install'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'list' => [
				'callback' => [$this, 'items'],
			],
			'terms' => [
				'callback' => [$this, 'terms'],
			],
			'categories' => [
				'callback' => [$this, 'categories'],
			],
			'detail' => [
				'callback' => [$this, 'detail'],
			],
			'stats' => [
				'callback' => [$this, 'stats'],
			],
			'changelog' => [
				'callback' => [$this, 'changelog'],
			],
			'demo-content' => [
				'callback' => [$this, 'demo_content'],
			],
			'install' => [
				'callback' => [$this, 'install'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'claim' => [
				'callback' => [$this, 'claim'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'download-additional' => [
				'callback' => [$this, 'download_additional'],
			],
			'comments' => [
				'callback' => [$this, 'get_comments'],
			],
			'request-update' => [
				'callback' => [$this, 'request_update'],
			],
		];
	}

	public function install(\WP_REST_Request $request)
	{
		$item_id = $request->get_param('item_id');
		$method = $request->get_param('method');
		$media_id = $request->get_param('media_id');
		$slug = $request->get_param('slug');
		$item_detail = Helper::engine_post('item/detail', [
			'item_id' => $item_id,
		]);
		if (is_wp_error($item_detail)) {
			return $item_detail;
		}
		$download_detail = Helper::engine_post('item/download', [
			'item_id' => $item_id,
			'method' => $method,
			'media_id' => $media_id,
		]);
		if (is_wp_error($download_detail)) {
			return $download_detail;
		}
		if (
			isset($download_detail['type']) &&
			$download_detail['type'] === 'delay'
		) {
			return $download_detail;
		}
		if ('template-kit' === $item_detail['type'] || 'download' === $method) {
			return $download_detail;
		}
		$installer = new Installer($item_detail, $download_detail, $slug);
		$status = $installer->run();

		if (is_wp_error($status)) {
			return new \WP_Error(
				400,
				__('Error running item installation/update', 'grootmade'),
			);
		}
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
		return ['success' => true];
	}
	public function claim(\WP_REST_Request $request)
	{
		$delay_token = $request->get_param('delay_token');
		$method = $request->get_param('method');
		$item_id = $request->get_param('item_id');
		$slug = $request->get_param('slug');
		$media_id = $request->get_param('media_id');

		$claim_detail = Helper::engine_post('item/download/claim', [
			'delay_token' => $delay_token,
		]);
		if (is_wp_error($claim_detail)) {
			return $claim_detail;
		}

		if ('download' === $method) {
			return $claim_detail;
		}

		$item_detail = Helper::engine_post('item/detail', [
			'item_id' => $item_id,
		]);
		if (is_wp_error($item_detail)) {
			return $item_detail;
		}

		if ('template-kit' === $item_detail['type']) {
			return $claim_detail;
		}

		$installer = new Installer($item_detail, $claim_detail, $slug);
		$status = $installer->run();

		if (is_wp_error($status)) {
			return new \WP_Error(
				400,
				__('Error running item installation/update', 'grootmade'),
			);
		}

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

		return ['success' => true];
	}

	public function request_update(\WP_REST_Request $request)
	{
		$item_id = (int) $request->get_param('item_id');
		$topic_id = (int) $request->get_param('topic_id');
		$version = trim((string) $request->get_param('version'));

		if ($item_id <= 0 || $topic_id <= 0 || $version === '') {
			return new \WP_Error(
				400,
				__('Invalid update request payload', 'grootmade'),
			);
		}

		return Helper::engine_post('update/request', [
			'item_id' => $item_id,
			'topic_id' => $topic_id,
			'version' => $version,
		]);
	}

	public function items(\WP_REST_Request $request)
	{
		$type = $request->get_param('type');
		if (is_string($type) && $type === 'theme,plugin') {
			return $this->items_merged_themes_plugins($request);
		}
		$page = $request->get_param('page');
		$keyword = $request->get_param('keyword');
		$filter = $request->get_param('filter');
		$sort = $request->get_param('sort');
		$per_page = $request->get_param('per_page');
		return Helper::engine_post('item/list', [
			'type' => $type,
			'page' => $page,
			'keyword' => $keyword,
			'filter' => $filter,
			'sort' => $sort,
			'per_page' => $per_page,
		]);
	}

	/**
	 * Browse-all catalog: engine list API expects a single type. Merge theme + plugin
	 * streams with the same sort as the engine uses per type (stream merge + offset slice).
	 *
	 * @return array|\WP_Error
	 */
	private function items_merged_themes_plugins(\WP_REST_Request $request)
	{
		$page = max(1, (int) ($request->get_param('page') ?? 1));
		$per_page = (int) ($request->get_param('per_page') ?? 30);
		if ($per_page < 1) {
			$per_page = 30;
		}
		if ($per_page > 90) {
			$per_page = 90;
		}

		$keyword = $request->get_param('keyword');
		$filter = $request->get_param('filter');
		$sort = $request->get_param('sort');
		if (!is_array($sort)) {
			$sort = [];
		}

		$offset = ($page - 1) * $per_page;
		$batch = max(50, $per_page);

		$base = [
			'keyword' => $keyword,
			'filter' => $filter,
			'sort' => $sort,
			'per_page' => $batch,
		];

		$tr = Helper::engine_post(
			'item/list',
			array_merge($base, [
				'type' => 'theme',
				'page' => 1,
			]),
		);
		if (is_wp_error($tr)) {
			return $tr;
		}
		$pr = Helper::engine_post(
			'item/list',
			array_merge($base, [
				'type' => 'plugin',
				'page' => 1,
			]),
		);
		if (is_wp_error($pr)) {
			return $pr;
		}

		$t_queue =
			isset($tr['data']) && is_array($tr['data']) ? $tr['data'] : [];
		$p_queue =
			isset($pr['data']) && is_array($pr['data']) ? $pr['data'] : [];
		$t_last = max(0, (int) ($tr['meta']['last_page'] ?? 0));
		$p_last = max(0, (int) ($pr['meta']['last_page'] ?? 0));
		$t_total = (int) ($tr['meta']['total'] ?? 0);
		$p_total = (int) ($pr['meta']['total'] ?? 0);
		$total = $t_total + $p_total;

		if ($total === 0) {
			return [
				'data' => [],
				'meta' => [
					'current_page' => $page,
					'last_page' => 0,
					'per_page' => $per_page,
					'total' => 0,
				],
			];
		}

		$last_page = (int) ceil($total / $per_page);

		$t_next = 2;
		$p_next = 2;
		$t_exhausted = $t_total === 0;
		$p_exhausted = $p_total === 0;

		$skipped = 0;
		$out = [];
		$max_steps = min(
			50000,
			$offset + $per_page + $batch * ($t_last + $p_last + 4),
		);

		for ($step = 0; $step < $max_steps; $step++) {
			if ($skipped >= $offset && count($out) >= $per_page) {
				break;
			}
			if (
				$t_exhausted &&
				$p_exhausted &&
				$t_queue === [] &&
				$p_queue === []
			) {
				break;
			}

			if ($t_queue === [] && !$t_exhausted) {
				if ($t_next > $t_last) {
					$t_exhausted = true;
				} else {
					$tn = Helper::engine_post(
						'item/list',
						array_merge($base, [
							'type' => 'theme',
							'page' => $t_next,
						]),
					);
					if (is_wp_error($tn)) {
						return $tn;
					}
					$t_queue =
						isset($tn['data']) && is_array($tn['data'])
							? $tn['data']
							: [];
					$t_last = max(
						$t_last,
						(int) ($tn['meta']['last_page'] ?? $t_last),
					);
					$t_next++;
					if ($t_queue === [] && $t_next > $t_last) {
						$t_exhausted = true;
					}
				}
			}

			if ($p_queue === [] && !$p_exhausted) {
				if ($p_next > $p_last) {
					$p_exhausted = true;
				} else {
					$pn = Helper::engine_post(
						'item/list',
						array_merge($base, [
							'type' => 'plugin',
							'page' => $p_next,
						]),
					);
					if (is_wp_error($pn)) {
						return $pn;
					}
					$p_queue =
						isset($pn['data']) && is_array($pn['data'])
							? $pn['data']
							: [];
					$p_last = max(
						$p_last,
						(int) ($pn['meta']['last_page'] ?? $p_last),
					);
					$p_next++;
					if ($p_queue === [] && $p_next > $p_last) {
						$p_exhausted = true;
					}
				}
			}

			if ($t_queue === [] && $p_queue === []) {
				continue;
			}

			$t_head = $t_queue[0] ?? null;
			$p_head = $p_queue[0] ?? null;

			if ($t_head === null) {
				$pick = 'p';
			} elseif ($p_head === null) {
				$pick = 't';
			} else {
				$pick =
					$this->compare_merged_items($t_head, $p_head, $sort) <= 0
						? 't'
						: 'p';
			}

			if ($pick === 't') {
				$item = array_shift($t_queue);
			} else {
				$item = array_shift($p_queue);
			}

			if ($item === null) {
				continue;
			}

			if ($skipped < $offset) {
				$skipped++;
			} else {
				$out[] = $item;
			}
		}

		return [
			'data' => $out,
			'meta' => [
				'current_page' => $page,
				'last_page' => $last_page,
				'per_page' => $per_page,
				'total' => $total,
			],
		];
	}

	/**
	 * @param array<string,mixed> $a
	 * @param array<string,mixed> $b
	 */
	private function compare_merged_items(array $a, array $b, array $sort): int
	{
		$by =
			isset($sort['order_by']) && is_string($sort['order_by'])
				? $sort['order_by']
				: 'popularity';
		$desc =
			!isset($sort['order']) ||
			!is_string($sort['order']) ||
			strtolower($sort['order']) !== 'asc';
		$sign = $desc ? -1 : 1;

		switch ($by) {
			case 'title':
				$cmp = strcasecmp(
					(string) ($a['title'] ?? ''),
					(string) ($b['title'] ?? ''),
				);
				break;
			case 'updated':
				$cmp =
					((int) ($a['updated'] ?? 0)) <=>
					((int) ($b['updated'] ?? 0));
				break;
			case 'added':
				$cmp =
					((int) ($a['created'] ?? 0)) <=>
					((int) ($b['created'] ?? 0));
				break;
			case 'views':
				$cmp =
					((int) ($a['install_count'] ?? 0)) <=>
					((int) ($b['install_count'] ?? 0));
				break;
			case 'popularity':
			default:
				$va =
					(int) ($a['install_count'] ?? 0) +
					(int) ($a['download_count'] ?? 0);
				$vb =
					(int) ($b['install_count'] ?? 0) +
					(int) ($b['download_count'] ?? 0);
				$cmp = $va <=> $vb;
				break;
		}

		$cmp *= $sign;
		if ($cmp !== 0) {
			return $cmp < 0 ? -1 : 1;
		}

		return strcmp((string) ($a['id'] ?? ''), (string) ($b['id'] ?? ''));
	}

	public function stats(\WP_REST_Request $request)
	{
		return Helper::engine_post('item/stats');
	}
}
