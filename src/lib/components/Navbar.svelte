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
	.navbar-wrapper {
		position: absolute;
		top: 1.25rem;
		left: 1.25rem;
		right: 1.25rem;
		z-index: 1000;
		pointer-events: none;
		display: flex;
		justify-content: center;
	}

	.navbar-container {
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		width: 100%;
		max-width: 1100px;
		padding: 0.65rem 1.25rem;
		background: rgba(11, 15, 23, 0.82);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 9999px;
		box-shadow:
			0 10px 30px -5px rgba(0, 0, 0, 0.7),
			0 0 1px 1px rgba(255, 255, 255, 0.05);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	/* Logo Placeholder Styling */
	.logo-placeholder {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		border: 1.5px dashed rgba(56, 189, 248, 0.6);
		background: rgba(56, 189, 248, 0.08);
		color: #38bdf8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
	}

	.logo-icon {
		width: 18px;
		height: 18px;
		opacity: 0.9;
	}

	.logo-badge-text {
		position: absolute;
		bottom: 1px;
		font-size: 7px;
		font-weight: 800;
		letter-spacing: 0.05em;
		color: #38bdf8;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
	}

	.brand-title {
		font-family: var(--font-sans, system-ui, sans-serif);
		font-weight: 800;
		font-size: 0.95rem;
		letter-spacing: 0.06em;
		background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.brand-sub {
		font-size: 0.72rem;
		color: #94a3b8;
		letter-spacing: 0.02em;
	}

	/* Single Tab */
	.nav-links {
		display: flex;
		align-items: center;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(56, 189, 248, 0.12);
		border: 1px solid rgba(56, 189, 248, 0.35);
		color: #ffffff;
		font-size: 0.88rem;
		font-weight: 600;
		padding: 0.45rem 1.1rem;
		border-radius: 9999px;
		cursor: pointer;
		box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
		transition: all 0.2s;
	}

	.nav-item:hover {
		background: rgba(56, 189, 248, 0.2);
		box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
	}

	.nav-dot {
		width: 7px;
		height: 7px;
		border-radius: 9999px;
		background: #38bdf8;
		box-shadow: 0 0 8px #38bdf8;
	}

	@media (max-width: 480px) {
		.brand-sub {
			display: none;
		}
		.navbar-container {
			padding: 0.5rem 1rem;
		}
	}
</style>
