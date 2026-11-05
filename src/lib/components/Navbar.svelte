<script>
	/**
	 * @typedef {Object} Props
	 * @property {() => void} [onResetView]
	 */

	/** @type {Props} */
	let { onResetView } = $props();
</script>

<header class="navbar-wrapper">
	<div class="navbar-container">
		<!-- Logo Placeholder -->
		<div class="brand">
			<div class="logo-placeholder" title="Logo Placeholder (sẽ thay thế sau)">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					class="logo-icon"
				>
					<rect x="3" y="3" width="18" height="18" rx="4" stroke-dasharray="3 3" />
					<circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
				<span class="logo-badge-text">LOGO</span>
			</div>
			<div class="brand-text">
				<span class="brand-title">BẢO TÀNG BÌNH QUỚI</span>
				<span class="brand-sub">Bán đảo Thanh Đa - Bình Quới</span>
			</div>
		</div>

		<!-- Single Tab Navigation -->
		<nav class="nav-links">
			<button class="nav-item active" onclick={onResetView}>
				<span class="nav-dot"></span>
				<span>Bản đồ</span>
			</button>
		</nav>
	</div>
</header>

<style>
	@layer components {
		.navbar-wrapper {
			position: absolute;
			inset-block-start: var(--space-page);
			inset-inline: var(--space-page);
			z-index: var(--z-navbar);
			display: flex;
			justify-content: center;
			container-type: inline-size;
			pointer-events: none;
		}

		.navbar-container {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--space-xs);
			inline-size: 100%;
			max-inline-size: var(--size-navbar-max);
			padding-block: var(--space-xs);
			padding-inline: var(--space-md);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-full);
			background: var(--color-surface);
			backdrop-filter: var(--blur-glass);
			box-shadow: var(--shadow-panel);
			pointer-events: auto;
		}

		.brand {
			display: flex;
			align-items: center;
			gap: var(--space-xs);
		}

		.logo-placeholder {
			position: relative;
			display: flex;
			flex-shrink: 0;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			inline-size: var(--size-logo);
			block-size: var(--size-logo);
			border: var(--border-thin) dashed var(--color-accent-border);
			border-radius: var(--radius-sm);
			background: var(--color-accent-soft);
			color: var(--color-accent);
		}

		.logo-icon {
			inline-size: var(--size-icon);
			block-size: var(--size-icon);
		}

		.logo-badge-text {
			position: absolute;
			inset-block-end: 0;
			font-size: var(--text-2xs);
			font-weight: var(--weight-extrabold);
			line-height: 1;
			letter-spacing: var(--tracking-snug);
		}

		.brand-text {
			display: flex;
			flex-direction: column;
		}

		.brand-title {
			background: var(--gradient-title);
			background-clip: text;
			color: transparent;
			font-size: var(--text-lg);
			font-weight: var(--weight-extrabold);
			letter-spacing: var(--tracking-wide);
		}

		.brand-sub {
			display: none;
			color: var(--color-text-muted);
			font-size: var(--text-sm);
			letter-spacing: var(--tracking-snug);
		}

		.nav-links {
			display: flex;
			flex-shrink: 0;
			align-items: center;
		}

		.nav-item {
			display: flex;
			align-items: center;
			gap: var(--space-xs);
			padding-block: var(--space-xs);
			padding-inline: var(--space-md);
			border: var(--border-thin) solid var(--color-accent-border);
			border-radius: var(--radius-full);
			background: var(--color-accent-soft);
			box-shadow: var(--glow-accent-soft);
			color: var(--color-text);
			font-size: var(--text-md);
			font-weight: var(--weight-semibold);
			cursor: pointer;
			transition:
				background-color var(--duration-fast),
				box-shadow var(--duration-fast);
		}

		.nav-item:hover {
			background: var(--color-accent-strong);
			box-shadow: var(--glow-accent-strong);
		}

		.nav-dot {
			inline-size: var(--size-dot);
			block-size: var(--size-dot);
			border-radius: var(--radius-full);
			background: var(--color-accent);
			box-shadow: var(--glow-accent);
		}

		@container (inline-size >= 30rem) {
			.navbar-container {
				gap: var(--space-lg);
				padding-inline: var(--space-lg);
			}

			.brand {
				gap: var(--space-sm);
			}

			.brand-sub {
				display: block;
			}
		}
	}
</style>
