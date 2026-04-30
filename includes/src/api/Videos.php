<?php

namespace Grootmade\api;

class Videos extends ApiBase
{
	private const SEED_VIDEO_URL = 'https://www.youtube.com/watch?v=6rsqChgT-2A';

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
		$cache_key = 'fv_youtube_videos_latest';
		$cached = get_transient($cache_key);
		if ($cached) {
			return $cached;
		}

		$channel_id = $this->resolve_channel_id_from_video(
			self::SEED_VIDEO_URL,
		);
		if (!$channel_id) {
			return new \WP_Error(400, __('Error loading videos.', 'grootmade'));
		}

		$feed_url =
			'https://www.youtube.com/feeds/videos.xml?channel_id=' .
			rawurlencode($channel_id);
		$response = wp_remote_get($feed_url, [
			'timeout' => 15,
			'headers' => [
				'Accept' => 'application/atom+xml,application/xml,text/xml',
			],
		]);

		if (is_wp_error($response)) {
			return new \WP_Error(400, __('Error loading videos.', 'grootmade'));
		}

		$code = (int) wp_remote_retrieve_response_code($response);
		$body = (string) wp_remote_retrieve_body($response);
		if ($code !== 200 || empty($body)) {
			return new \WP_Error(400, __('Error loading videos.', 'grootmade'));
		}

		$videos = $this->parse_feed($body);
		set_transient($cache_key, $videos, 30 * MINUTE_IN_SECONDS);

		return rest_ensure_response($videos);
	}

	private function resolve_channel_id_from_video($video_url)
	{
		$response = wp_remote_get($video_url, [
			'timeout' => 15,
			'headers' => [
				'Accept-Language' => 'en-US,en;q=0.9',
			],
		]);

		if (is_wp_error($response)) {
			return null;
		}

		$html = (string) wp_remote_retrieve_body($response);
		if (empty($html)) {
			return null;
		}

		if (preg_match('/"channelId":"(UC[\w-]+)"/', $html, $matches) === 1) {
			return $matches[1];
		}

		if (
			preg_match(
				'/<meta itemprop="channelId" content="(UC[\w-]+)">/i',
				$html,
				$matches,
			) === 1
		) {
			return $matches[1];
		}

		return null;
	}

	private function parse_feed($xml_body)
	{
		if (!function_exists('simplexml_load_string')) {
			return [];
		}

		$xml = simplexml_load_string(
			$xml_body,
			'SimpleXMLElement',
			LIBXML_NOCDATA,
		);
		if (!$xml) {
			return [];
		}

		$videos = [];
		foreach ($xml->entry as $entry) {
			$yt = $entry->children('yt', true);
			$media = $entry->children('media', true);
			$group = $media->group;

			$thumbnail = '';
			if (isset($group->thumbnail[0])) {
				$thumb_attr = $group->thumbnail[0]->attributes();
				$thumbnail = isset($thumb_attr['url'])
					? (string) $thumb_attr['url']
					: '';
			}

			$videos[] = [
				'id' => isset($yt->videoId) ? (string) $yt->videoId : '',
				'title' => isset($entry->title) ? (string) $entry->title : '',
				'url' => isset($entry->link)
					? (string) $entry->link->attributes()->href
					: '',
				'published_at' => isset($entry->published)
					? (string) $entry->published
					: '',
				'thumbnail' => $thumbnail,
			];
		}

		return array_slice($videos, 0, 24);
	}
}
