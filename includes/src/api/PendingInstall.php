<?php

namespace Grootmade\api;

use Grootmade\AutoUpdate;
use Grootmade\Constants;

class PendingInstall extends ApiBase
{
	protected function prefix()
	{
		return 'pending-install';
	}

	public function endpoints()
	{
		return [
			'create' => [
				'methods' => 'POST',
				'callback' => [$this, 'check_now'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'read' => [
				'methods' => 'GET',
				'callback' => [$this, 'get_status'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'check-now' => [
				'methods' => 'POST',
				'callback' => [$this, 'check_now'],
				'permission_callback' => [$this, 'user_can_install'],
			],
			'status' => [
				'methods' => 'GET',
				'callback' => [$this, 'get_status'],
				'permission_callback' => [$this, 'user_can_install'],
			],
		];
	}

	/**
	 * Immediately check for and execute pending installs.
	 */
	public function check_now(\WP_REST_Request $request)
	{
		$count = AutoUpdate::get_instance()->check_pending_installs();

		// Also trigger the scheduled events right away
		spawn_cron();

		return [
			'success' => true,
			'message' =>
				$count > 0
					? sprintf('%d item(s) queued for installation', $count)
					: 'No pending installs found',
			'count' => $count,
		];
	}

	/**
	 * Return the status of the last pending installs check.
	 */
	public function get_status(\WP_REST_Request $request)
	{
		$last_check = get_option(
			Constants::SLUG . '_pending_installs_last_check',
			null,
		);
		$next_scheduled = wp_next_scheduled(
			Constants::SLUG . '/pending-installs',
		);

		return [
			'success' => true,
			'last_check' => $last_check,
			'next_scheduled' => $next_scheduled ? $next_scheduled : null,
		];
	}
}
