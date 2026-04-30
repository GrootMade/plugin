<?php

namespace Grootmade;

use Grootmade\api\{
	Announcement,
	ApiBase,
	Collection,
	Documentation,
	Disclaimer,
	History,
	Item,
	License,
	Pack,
	PendingInstall,
	Popular,
	Setting,
	Update,
	Videos,
};

class RestAPI
{
	/**
	 * @var static
	 */
	private static $instance = null;

	function __construct()
	{
		$this->register(new License());
		$this->register(new Item());
		$this->register(new Update());
		$this->register(new Setting());
		$this->register(new Announcement());
		$this->register(new Documentation());
		$this->register(new History());
		$this->register(new Collection());
		$this->register(new Pack());
		$this->register(new Popular());
		$this->register(new Disclaimer());
		$this->register(new PendingInstall());
		$this->register(new Videos());
	}

	public static function get_instance()
	{
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * @param ApiBase $instance
	 */
	private function register(ApiBase $instance)
	{
		$instance->register();
	}
}
