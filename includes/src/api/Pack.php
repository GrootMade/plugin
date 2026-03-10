<?php

namespace Grootmade\api;

use Grootmade\Helper;

class Pack extends ApiBase
{
	function download_pack(\WP_REST_Request $request)
	{
		$item_ids = $request->get_param('item_ids');

		if (!is_array($item_ids) || empty($item_ids)) {
			return new \WP_Error(400, __('item_ids is required', 'grootmade'));
		}

		return Helper::engine_post('pack/download', [
			'item_ids' => array_map('intval', $item_ids),
			'pack_name' => $request->get_param('pack_name') ?? 'Pack',
		]);
	}

	public function endpoints()
	{
		return [
			'download' => [
				'callback' => [$this, 'download_pack'],
			],
		];
	}
}
