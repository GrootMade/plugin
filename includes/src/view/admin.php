<?php
namespace Grootmade\view;

if (!defined('ABSPATH')) {
	exit(); // Exit if accessed directly.
} ?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> suppressHydrationWarning>

<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title></title>
	<base target="_parent">
	<link
		href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
		rel="stylesheet" />
	<style>
		/* Critical inline styles to prevent flash of unstyled content */
		:root { --background: 0 0% 100%; }
		/* Match grootmade.com dark theme — pure near-black */
		.dark { --background: 0 0% 5%; }
		html, body { margin: 0; background-color: hsl(var(--background)); }
		#app { opacity: 0; transition: opacity .15s ease-in; }
		#app.ready { opacity: 1; }
	</style>
	<script>
		/* Apply theme class immediately to prevent flash */
		(function() {
			var theme = localStorage.getItem('color-scheme') || 'system';
			if (theme === 'system') {
				theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
			document.documentElement.classList.add(theme);
		})();
	</script>
		<?php wp_print_head_scripts(); ?>
</head>

<body class="font-sans">
	<div id="app"></div>
	<?php wp_print_footer_scripts(); ?>
</body>

</html>
