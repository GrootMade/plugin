<?php
/*
 * Plugin Name: GrootMade
 * Plugin URI: https://grootmade.com
 * Description: Your all-in-one dashboard for discovering, installing, and managing premium themes, plugins, and template kits.
 * Version: 6.1.30
 * Requires at Least: 6.0
 * Requires PHP: 7.4
 * Author: Grootmade
 * Author URI: https://github.com/GrootMade/connect
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: grootmade
 **/
namespace Grootmade {
	if (file_exists(__DIR__ . '/includes/lib/autoload.php')) {
		require_once __DIR__ . '/includes/lib/autoload.php';
		Plugin::get_instance(__FILE__);
		Upgrade::get_instance(__FILE__);
	}
}
