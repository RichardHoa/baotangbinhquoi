<script>
	import 'leaflet/dist/leaflet.css';
	import DemoLinks from './demo/DemoLinks.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import favicon from '#lib/assets/favicon.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	let showDemos = $state(false);
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
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-root dark-theme">
	{@render children()}
</div>

<div class="sr-only" aria-hidden="true">
	{#each locales as locale (locale)}
		<a href={resolve(/** @type {any} */ (localizeHref(page.url.pathname, { locale })))}>{locale}</a>
	{/each}
</div>

{#if showDemos}
	<div class="demo-wrapper">
		<button class="close-demo" onclick={() => (showDemos = false)} aria-label="Đóng bảng demo"
			>×</button
		>
		<DemoLinks />
	</div>
{/if}

<style>
	:global(:root) {
		--bg-primary: #070b14;
		--bg-surface: #0e1626;
		--bg-surface-glass: rgba(14, 22, 38, 0.75);
		--border-subtle: rgba(255, 255, 255, 0.08);
		--border-accent: rgba(56, 189, 248, 0.3);
		--text-main: #f1f5f9;
		--text-muted: #94a3b8;
		--text-dim: #64748b;
		--accent-cyan: #38bdf8;
		--accent-emerald: #10b981;
		--accent-amber: #f59e0b;
		--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
		--font-serif: 'Playfair Display', Georgia, serif;
	}

	:global(html, body) {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: var(--bg-primary);
		color: var(--text-main);
		font-family: var(--font-sans);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color-scheme: dark;
	}

	.app-root {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
		background: #070b14;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.demo-wrapper {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 99999;
	}

	.close-demo {
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 9999px;
		background: #000;
		color: #fff;
		border: 1px solid #fff;
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100000;
	}

	/* Tùy chỉnh Leaflet cho Dark Mode */
	:global(.leaflet-container) {
		background: #070b14 !important;
		font-family: var(--font-sans) !important;
		width: 100%;
		height: 100%;
	}

	:global(.leaflet-bar) {
		border: 1px solid rgba(255, 255, 255, 0.15) !important;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
		border-radius: 12px !important;
		overflow: hidden;
	}

	:global(.leaflet-bar a) {
		background-color: rgba(15, 23, 42, 0.85) !important;
		backdrop-filter: blur(8px);
		color: #f1f5f9 !important;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
		transition: background-color 0.2s;
	}

	:global(.leaflet-bar a:hover) {
		background-color: rgba(30, 41, 59, 0.95) !important;
		color: #38bdf8 !important;
	}

	:global(.leaflet-popup-content-wrapper) {
		background: rgba(14, 22, 38, 0.92) !important;
		backdrop-filter: blur(12px) !important;
		color: #f1f5f9 !important;
		border: 1px solid rgba(56, 189, 248, 0.3) !important;
		border-radius: 16px !important;
		box-shadow:
			0 20px 30px -10px rgba(0, 0, 0, 0.8),
			0 0 20px rgba(56, 189, 248, 0.2) !important;
		padding: 0 !important;
	}

	:global(.leaflet-popup-tip) {
		background: rgba(14, 22, 38, 0.92) !important;
		border: 1px solid rgba(56, 189, 248, 0.3);
	}

	:global(.leaflet-popup-content) {
		margin: 0 !important;
		line-height: 1.5;
	}

	:global(.leaflet-container a.leaflet-popup-close-button) {
		color: #94a3b8 !important;
		padding: 8px 10px 0 0 !important;
		font-size: 18px !important;
	}

	:global(.leaflet-container a.leaflet-popup-close-button:hover) {
		color: #38bdf8 !important;
	}

	:global(.leaflet-control-attribution) {
		background: rgba(7, 11, 20, 0.75) !important;
		backdrop-filter: blur(6px);
		color: #64748b !important;
		font-size: 11px !important;
		border-top-left-radius: 8px;
		padding: 2px 8px !important;
	}

	:global(.leaflet-control-attribution a) {
		color: #94a3b8 !important;
	}
</style>
