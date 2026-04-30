<?php

namespace Grootmade\api;

class Documentation extends ApiBase
{
	public function endpoints()
	{
		return [
			'read' => [
				'methods' => 'POST',
				'callback' => [$this, 'latest'],
			],
			'read/topic' => [
				'methods' => 'POST',
				'callback' => [$this, 'topic'],
			],
			'latest' => [
				'methods' => 'POST',
				'callback' => [$this, 'latest'],
			],
		];
	}

	public function latest(\WP_REST_Request $request)
	{
		$url = 'https://meta.grootmade.com/c/documentation/8.json';
		$key = 'fv_meta_docs_topics_8_v2';
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
				__('Error loading documentation topics.', 'grootmade'),
			);
		}

		$code = (int) wp_remote_retrieve_response_code($response);
		$body = json_decode((string) wp_remote_retrieve_body($response), true);
		if ($code !== 200 || !is_array($body)) {
			return new \WP_Error(
				400,
				__('Error loading documentation topics.', 'grootmade'),
			);
		}

		$topic_list =
			isset($body['topic_list']) && is_array($body['topic_list'])
				? $body['topic_list']
				: [];
		$raw_topics =
			isset($topic_list['topics']) && is_array($topic_list['topics'])
				? array_slice($topic_list['topics'], 0, 30)
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

			if (strlen($excerpt) > 220) {
				$excerpt = substr($excerpt, 0, 217) . '...';
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
				'posts_count' => isset($topic['posts_count'])
					? (int) $topic['posts_count']
					: null,
				'views' => isset($topic['views'])
					? (int) $topic['views']
					: null,
				'like_count' => isset($topic['like_count'])
					? (int) $topic['like_count']
					: null,
				'excerpt' => $excerpt,
			];
		}, $raw_topics);

		set_transient($key, $topics, 30 * MINUTE_IN_SECONDS);

		return $topics;
	}

	public function topic(\WP_REST_Request $request)
	{
		$topic_id = (int) $request->get_param('id');
		if ($topic_id <= 0) {
			return new \WP_Error(
				400,
				__('Invalid documentation topic.', 'grootmade'),
			);
		}

		$key = sprintf('fv_meta_docs_topic_%d_v1', $topic_id);
		$cached = get_transient($key);
		if ($cached) {
			return $cached;
		}

		$url = sprintf('https://meta.grootmade.com/t/%d.json', $topic_id);
		$response = wp_remote_get($url, [
			'timeout' => 15,
			'headers' => [
				'Accept' => 'application/json',
			],
		]);

		if (is_wp_error($response)) {
			return new \WP_Error(
				400,
				__('Error loading documentation topic.', 'grootmade'),
			);
		}

		$code = (int) wp_remote_retrieve_response_code($response);
		$body = json_decode((string) wp_remote_retrieve_body($response), true);
		if ($code !== 200 || !is_array($body)) {
			return new \WP_Error(
				400,
				__('Error loading documentation topic.', 'grootmade'),
			);
		}

		$posts =
			isset($body['post_stream']['posts']) &&
			is_array($body['post_stream']['posts'])
				? $body['post_stream']['posts']
				: [];
		$first_post = isset($posts[0]) && is_array($posts[0]) ? $posts[0] : [];

		$payload = [
			'id' => isset($body['id']) ? (int) $body['id'] : $topic_id,
			'title' => isset($body['title']) ? (string) $body['title'] : '',
			'slug' => isset($body['slug']) ? (string) $body['slug'] : '',
			'last_posted_at' => isset($body['last_posted_at'])
				? (string) $body['last_posted_at']
				: '',
			'posts_count' => isset($body['posts_count'])
				? (int) $body['posts_count']
				: null,
			'views' => isset($body['views']) ? (int) $body['views'] : null,
			'like_count' => isset($body['like_count'])
				? (int) $body['like_count']
				: null,
			'cooked' => isset($first_post['cooked'])
				? (string) $first_post['cooked']
				: '',
			'external_url' => sprintf(
				'https://meta.grootmade.com/t/%s/%d',
				isset($body['slug']) ? (string) $body['slug'] : '',
				$topic_id,
			),
		];

		set_transient($key, $payload, 15 * MINUTE_IN_SECONDS);

		return $payload;
	}
}
