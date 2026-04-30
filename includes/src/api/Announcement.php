<?php

namespace Grootmade\api;

class Announcement extends ApiBase
{
	public function endpoints()
	{
		return [
			'read' => [
				'methods' => 'POST',
				'callback' => [$this, 'latest'],
			],
			'latest' => [
				'methods' => 'POST',
				'callback' => [$this, 'latest'],
			],
		];
	}

	public function latest(\WP_REST_Request $request)
	{
		$url = 'https://meta.grootmade.com/c/announcements/6.json';
		$key = 'fv_meta_topics_6';
		$cached = get_transient($key);
		if ($cached) {
			return $cached;
		}

		$response = wp_remote_get($url, [
			'timeout' => 15,
			'headers' => [
				'Accept' => 'application/json',
			],
		]);

		if (is_wp_error($response)) {
			return new \WP_Error(
				400,
				__('Error loading announcements.', 'grootmade'),
			);
		}

		$code = (int) wp_remote_retrieve_response_code($response);
		$body = json_decode((string) wp_remote_retrieve_body($response), true);

		if ($code !== 200 || !is_array($body)) {
			return new \WP_Error(
				400,
				__('Error loading announcements.', 'grootmade'),
			);
		}

		$topic_list =
			isset($body['topic_list']) && is_array($body['topic_list'])
				? $body['topic_list']
				: [];
		$raw_topics =
			isset($topic_list['topics']) && is_array($topic_list['topics'])
				? array_slice($topic_list['topics'], 0, 6)
				: [];

		$topics = array_map(function ($topic) {
			$excerpt_source = '';
			if (isset($topic['excerpt']) && is_string($topic['excerpt'])) {
				$excerpt_source = $topic['excerpt'];
			} elseif (isset($topic['cooked']) && is_string($topic['cooked'])) {
				$excerpt_source = $topic['cooked'];
			}

			$excerpt = trim(wp_strip_all_tags((string) $excerpt_source));
			if (function_exists('html_entity_decode')) {
				$excerpt = html_entity_decode(
					$excerpt,
					ENT_QUOTES | ENT_HTML5,
					'UTF-8',
				);
			}

			if (strlen($excerpt) > 180) {
				$excerpt = substr($excerpt, 0, 177) . '...';
			}

			return [
				'id' => isset($topic['id']) ? (int) $topic['id'] : 0,
				'title' => isset($topic['title'])
					? (string) $topic['title']
					: '',
				'slug' => isset($topic['slug']) ? (string) $topic['slug'] : '',
				'last_posted_at' => isset($topic['last_posted_at'])
					? (string) $topic['last_posted_at']
					: '',
				'excerpt' => $excerpt,
			];
		}, $raw_topics);

		set_transient($key, $topics, 30 * MINUTE_IN_SECONDS);

		return rest_ensure_response($topics);
	}
}
