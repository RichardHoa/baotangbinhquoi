<script>
	import '#lib/styles/app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import favicon from '#lib/assets/favicon.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>Bảo Tàng Bình Quới | Không Gian Di Sản & Sinh Thái Sông Sài Gòn</title>
	<meta
		name="description"
		content="Khám phá bản đồ tương tác và không gian văn hóa di sản Bán đảo Thanh Đa - Bình Quới"
	/>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<div class="sr-only" aria-hidden="true">
	{#each locales as locale (locale)}
		<a
			tabindex="-1"
			href={resolve(/** @type {any} */ (localizeHref(page.url.pathname, { locale })))}>{locale}</a
		>
	{/each}
</div>
