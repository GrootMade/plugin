<?php
namespace Grootmade;

class Admin
{
	/**
	 * @var mixed
	 */
	private static $instance = null;

	/**
	 * @var mixed
	 */
	private $page = null;

	/**
	 * @var mixed
	 */
	private $update_details = null;

	/**
	 * @var mixed
	 *
	 */
	function __construct()
	{
		add_action('admin_menu', [$this, 'admin_menu']);
		add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
		add_action('admin_notices', [$this, 'upgrade_notice']);
		add_action('admin_init', [$this, 'admin_init']);
		add_filter('plugin_row_meta', [$this, 'plugin_row_meta'], 10, 4);
		add_filter(
			'plugin_action_links_' .
				plugin_basename(Plugin::p_dir('plugin.php')),
			[$this, 'plugin_action_links'],
		);
		add_action('wp_ajax_' . Constants::SLUG . '_check_updates', [
			$this,
			'ajax_check_for_updates',
		]);
		add_action('admin_footer-plugins.php', [
			$this,
			'check_updates_inline_script',
		]);
	}

	/**
	 * @param $screen
	 */
	public function admin_enqueue_scripts($screen)
	{
		$css = $js = [];
		$css[] =
			'li#toplevel_page_' .
			Constants::ADMIN_PAGE_ID .
			'.menu-top{ background: rgb(230,13,145);background: linear-gradient(90deg, rgba(230,13,145,1) 0%, rgba(230,13,82,1) 50%); transition:background ease-in-out .5s;}';
		$css[] =
			'li#toplevel_page_' .
			Constants::ADMIN_PAGE_ID .
			'.menu-top a,li#toplevel_page_' .
			Constants::ADMIN_PAGE_ID .
			'.menu-top div.wp-menu-image:before{ color:#FFF;}';
		$css[] =
			'li#toplevel_page_' .
			Constants::ADMIN_PAGE_ID .
			'.menu-top:hover{ background: rgb(230,13,145);background: linear-gradient(90deg, rgba(230,13,145,1) 0%, rgba(230,13,82,1) 10%)}';
		$css[] =
			'li#toplevel_page_' .
			Constants::ADMIN_PAGE_ID .
			'.menu-top:hover{ background: rgb(230,13,145);background: linear-gradient(90deg, rgba(230,13,145,1) 0%, rgba(230,13,82,1) 10%)}';
		wp_add_inline_style('wp-admin', implode('', $css));
		$js[] = "jQuery(function($){";
		$js[] =
			'$("li#toplevel_page_' .
			Constants::ADMIN_PAGE_ID .
			'").addClass("wp-has-current-submenu wp-menu-open").removeClass("wp-not-current-submenu");';
		$js[] =
			'$("li#toplevel_page_' .
			Constants::ADMIN_PAGE_ID .
			' li.wp-first-item").remove();';

		$js[] = '});';
		\wp_add_inline_script('jquery', implode('', $js));
	}

	public function admin_init()
	{
		$key = Constants::SLUG . '_installed';
		$this->update_details = \get_transient($key);
		if ($this->update_details == null) {
			$this->update_details = Helper::get_item_updates();
			if (!\is_wp_error($this->update_details)) {
				\set_transient(
					$key,
					$this->update_details,
					15 * \MINUTE_IN_SECONDS,
				);
			} else {
				$this->update_details = null;
			}
		}
		if ($this->is_current()) {
			$this->enqueue_scripts();
			$this->render_page();
			die();
		}
	}

	public function admin_menu()
	{
		$this->page = \add_menu_page(
			Constants::ADMIN_PAGE_TITLE,
			Constants::ADMIN_MENU_TITLE,
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID,
			[$this, 'render_page'],
			'dashicons-smiley',
			80,
		);
		\add_submenu_page(
			Constants::ADMIN_PAGE_ID,
			__('Dashboard', 'grootmade'),
			__('Dashboard', 'grootmade'),
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID . '#/',
			[$this, 'render_page'],
		);
		\add_submenu_page(
			Constants::ADMIN_PAGE_ID,
			__('Themes', 'grootmade'),
			__('Themes', 'grootmade'),
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID . '#/item/theme',
			[$this, 'render_page'],
		);
		\add_submenu_page(
			Constants::ADMIN_PAGE_ID,
			__('Plugins', 'grootmade'),
			__('Plugins', 'grootmade'),
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID . '#/item/plugin',
			[$this, 'render_page'],
		);
		\add_submenu_page(
			Constants::ADMIN_PAGE_ID,
			__('Template Kits', 'grootmade'),
			__('Template Kits', 'grootmade'),
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID . '#/item/template-kit',
			[$this, 'render_page'],
		);
		\add_submenu_page(
			Constants::ADMIN_PAGE_ID,
			__('Updates', 'grootmade'),
			__('Updates', 'grootmade'),
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID . '#/updates',
			[$this, 'render_page'],
		);
		\add_submenu_page(
			Constants::ADMIN_PAGE_ID,
			__('License', 'grootmade'),
			__('License', 'grootmade'),
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID . '#/activation',
			[$this, 'render_page'],
		);
		\add_submenu_page(
			Constants::ADMIN_PAGE_ID,
			__('Settings', 'grootmade'),
			__('Settings', 'grootmade'),
			'access_' . Constants::ADMIN_PAGE_ID,
			Constants::ADMIN_PAGE_ID . '#/settings',
			[$this, 'render_page'],
		);
	}

	public function enqueue_scripts()
	{
		$assets = new ViteAssets(
			Plugin::p_dir('build'),
			Plugin::p_url('build'),
		);
		$assets->enqueue('src/index.tsx', [
			'handle' => Constants::SLUG . '-script',
			'script-dependencies' => [
				'wp-element',
				'wp-api-fetch',
				'wp-i18n',
				'wp-html-entities',
				'moment',
			],
		]);
		$locale = \get_user_meta(
			\get_current_user_id(),
			Constants::SLUG . '_lang',
			true,
		);

		if (!$locale) {
			\update_user_meta(
				\get_current_user_id(),
				Constants::SLUG . '_lang',
				'en-US',
			);
		}
		wp_localize_script(Constants::SLUG . '-script', 'AVAILABLE_I18NS', [
			'locale' => $locale,
			'available' => Helper::get_available_languages(),
		]);
		$lang_content = Helper::get_langauge_file(
			str_replace('-', '_', $locale),
		);
		if ($lang_content) {
			wp_add_inline_script(
				Constants::SLUG . '-script',
				'( function( domain, translations ) {var localeData = translations.locale_data[ domain ] || translations.locale_data.messages;	localeData[""].domain = domain;	wp.i18n.setLocaleData( localeData, domain );} )("' .
					Constants::TEXTDOMAIN .
					'",' .
					json_encode($lang_content) .
					');',
				'after',
			);
		}
	}

	public static function get_instance()
	{
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function is_current()
	{
		return !empty($_GET['page']) &&
			Constants::ADMIN_PAGE_ID === $_GET['page'];
	}

	/**
	 * @param $plugin_meta
	 * @param $plugin_file
	 * @param $plugin_data
	 * @param $status
	 * @return array
	 */
	public function plugin_row_meta(
		$plugin_meta,
		$plugin_file,
		$plugin_data,
		$status,
	) {
		if (
			$this->update_details &&
			!is_wp_error($this->update_details) &&
			isset($this->update_details['data'])
		) {
			foreach ($this->update_details['data'] as $item) {
				if (
					$plugin_file === $item['path'] &&
					$item['type'] === 'plugin' &&
					$item['is_forked']
				) {
					$plugin_meta[] = sprintf(
						'<span style="color: green;">Forked from <strong>%s</strong></span>',
						$item['original_title'],
					);
				}
			}
		}
		return $plugin_meta;
	}

	/**
	 * Add Settings and Check for Updates links to the plugin action links.
	 *
	 * @param array $links
	 * @return array
	 */
	public function plugin_action_links($links)
	{
		$settings_url = \admin_url(
			'admin.php?page=' . Constants::ADMIN_PAGE_ID . '#/settings',
		);

		$custom_links = [
			'settings' => sprintf(
				'<a href="%s">%s</a>',
				\esc_url($settings_url),
				__('Settings', 'grootmade'),
			),
			'check_updates' => sprintf(
				'<a href="#" id="%s-check-updates" data-nonce="%s">%s</a>',
				\esc_attr(Constants::SLUG),
				\wp_create_nonce(Constants::SLUG . '_check_updates'),
				__('Check for updates', 'grootmade'),
			),
		];

		return array_merge($custom_links, $links);
	}

	/**
	 * AJAX handler for check-for-updates.
	 */
	public function ajax_check_for_updates()
	{
		if (
			!\current_user_can('update_plugins') ||
			!\check_ajax_referer(
				Constants::SLUG . '_check_updates',
				'nonce',
				false,
			)
		) {
			\wp_send_json_error(
				['message' => __('Unauthorized', 'grootmade')],
				403,
			);
		}

		// Clear caches
		\delete_transient(Constants::SLUG . '_upgrade_info');
		\delete_site_transient('update_plugins');
		\wp_update_plugins();

		// Check if an update is now available
		$update_plugins = \get_site_transient('update_plugins');
		$plugin_file = plugin_basename(Plugin::p_dir('plugin.php'));
		$has_update =
			isset($update_plugins->response[$plugin_file]) &&
			!empty($update_plugins->response[$plugin_file]->new_version);

		if ($has_update) {
			$new_version = $update_plugins->response[$plugin_file]->new_version;
			\wp_send_json_success([
				'update_available' => true,
				'new_version' => $new_version,
				'message' => sprintf(
					/* translators: %s: version number */
					__(
						'Update available: version %s. Reload the page to update.',
						'grootmade',
					),
					$new_version,
				),
				'update_url' => \admin_url('plugins.php'),
			]);
		} else {
			\wp_send_json_success([
				'update_available' => false,
				'message' => __(
					'You are running the latest version.',
					'grootmade',
				),
			]);
		}
	}

	/**
	 * Inline JS for the AJAX check-for-updates link on the plugins page.
	 */
	public function check_updates_inline_script()
	{
		$slug = \esc_js(Constants::SLUG); ?>
		<script>
		(function(){
			var link = document.getElementById('<?php echo $slug; ?>-check-updates');
			if (!link) return;
			link.addEventListener('click', function(e) {
				e.preventDefault();
				var original = link.textContent;
				link.textContent = '<?php echo \esc_js(__('Checking...', 'grootmade')); ?>';
				link.style.pointerEvents = 'none';
				link.style.opacity = '0.6';
				var data = new FormData();
				data.append('action', '<?php echo $slug; ?>_check_updates');
				data.append('nonce', link.dataset.nonce);
				fetch(ajaxurl, { method: 'POST', body: data })
					.then(function(r){ return r.json(); })
					.then(function(res){
						if (res.success && res.data.update_available) {
							link.textContent = res.data.message;
							link.style.color = '#2271b1';
							link.style.fontWeight = 'bold';
							link.style.pointerEvents = 'auto';
							link.style.opacity = '1';
							link.addEventListener('click', function(){
								window.location.reload();
							});
						} else if (res.success) {
							link.textContent = res.data.message;
							link.style.color = '#00a32a';
							link.style.opacity = '1';
							setTimeout(function(){
								link.textContent = original;
								link.style.color = '';
								link.style.pointerEvents = 'auto';
							}, 3000);
						} else {
							link.textContent = '<?php echo \esc_js(
       	__('Error checking updates', 'grootmade'),
       ); ?>';
							link.style.color = '#d63638';
							link.style.opacity = '1';
							setTimeout(function(){
								link.textContent = original;
								link.style.color = '';
								link.style.pointerEvents = 'auto';
							}, 3000);
						}
					})
					.catch(function(){
						link.textContent = '<?php echo \esc_js(
      	__('Error checking updates', 'grootmade'),
      ); ?>';
						link.style.color = '#d63638';
						link.style.opacity = '1';
						setTimeout(function(){
							link.textContent = original;
							link.style.color = '';
							link.style.pointerEvents = 'auto';
						}, 3000);
					});
			});
		})();
		</script>
		<?php
	}

	public function upgrade_notice()
	{
		if (!\current_user_can('manage_options')) {
			return;
		}

		$activation_key = \get_option(Constants::ACTIVATION_KEY);

		if (empty($activation_key)) {
			$message = __(
				'Activate your GrootMade license to unlock downloads, auto-updates, and bulk actions.',
				'grootmade',
			);
			$cta_text = __('Activate License', 'grootmade');
			$cta_url = \admin_url(
				'admin.php?page=' . Constants::ADMIN_PAGE_ID . '#/activation',
			);
		} else {
			$detail = Helper::get_activation_detail();

			if (!$detail || !is_array($detail)) {
				return;
			}

			$download_allowed = !empty($detail['download_allowed']);
			$plan_type = $detail['plan_type'] ?? '';
			$is_gold = !empty($detail['gold']);

			if (!$download_allowed) {
				$message = __(
					'Upgrade your GrootMade plan to unlock downloads, auto-updates, and premium features.',
					'grootmade',
				);
				$cta_text = __('View Plans', 'grootmade');
				$cta_url = 'https://grootmade.com/pricing';
			} elseif ($is_gold) {
				return;
			} elseif (in_array($plan_type, ['recurring', 'onetime'], true)) {
				$message = __(
					'Go Lifetime — Upgrade to a lifetime plan for unlimited access with no recurring fees.',
					'grootmade',
				);
				$cta_text = __('Upgrade', 'grootmade');
				$cta_url = 'https://grootmade.com/pricing';
			} else {
				return;
			}
		}

		$logo_url = Plugin::p_url('public/logo.svg');

		echo '<style>';
		echo '.grootmade-upgrade-notice{border:none;border-left:4px solid #2563eb;background:linear-gradient(135deg,#fff 0%,#eff6ff 100%);padding:0;margin:5px 0 10px;display:flex;align-items:stretch;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.08);}';
		echo '.grootmade-upgrade-notice .grootmade-notice-logo{flex-shrink:0;width:46px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);padding:8px;}';
		echo '.grootmade-upgrade-notice .grootmade-notice-logo img{width:24px;height:24px;filter:brightness(0) invert(1);}';
		echo '.grootmade-upgrade-notice .grootmade-notice-body{flex:1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;}';
		echo '.grootmade-upgrade-notice .grootmade-notice-text{font-size:13px;line-height:1.35;color:#1d2327;}';
		echo '.grootmade-upgrade-notice .grootmade-notice-text strong{color:#2563eb;}';
		echo '.grootmade-upgrade-notice .grootmade-notice-cta{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:12.5px;white-space:nowrap;transition:opacity .2s,transform .2s;box-shadow:0 2px 6px rgba(37,99,235,0.25);}';
		echo '.grootmade-upgrade-notice .grootmade-notice-cta:hover{opacity:.9;color:#fff;transform:translateY(-1px);}';
		echo '.grootmade-upgrade-notice .grootmade-notice-cta svg{width:14px;height:14px;fill:currentColor;}';
		echo '</style>';

		$arrow =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

		printf(
			'<div class="notice grootmade-upgrade-notice">' .
				'<div class="grootmade-notice-logo"><img src="%s" alt="GrootMade"></div>' .
				'<div class="grootmade-notice-body">' .
				'<span class="grootmade-notice-text"><strong>GrootMade</strong> — %s</span>' .
				'<a href="%s" class="grootmade-notice-cta" target="%s">%s %s</a>' .
				'</div>' .
				'</div>',
			\esc_url($logo_url),
			\esc_html($message),
			\esc_url($cta_url),
			empty($activation_key) ? '_self' : '_blank',
			\esc_html($cta_text),
			$arrow,
		);
	}

	public function render_page()
	{
		require __DIR__ . '/view/admin.php';
	}
}
