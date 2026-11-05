<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import { MAP_CENTER, DEFAULT_ZOOM } from '#lib/data/binhquoi.js';

	let mapContainer = $state(/** @type {HTMLElement | null} */ (null));
	let mapInstance = $state(/** @type {any} */ (null));

	export function resetToOverview() {
		if (mapInstance) {
			// Leaflet animates flyTo from JS, out of reach of the CSS reduced-motion reset
			mapInstance.flyTo(MAP_CENTER, DEFAULT_ZOOM, {
				animate: !matchMedia('(prefers-reduced-motion: reduce)').matches,
				duration: 1.2
			});
		}
	}

	onMount(async () => {
		if (!browser || !mapContainer) return;

		// Dynamically import Leaflet to support SSR / Cloudflare Workers
		const L = (await import('leaflet')).default;

		// Initialize Map centered on Bình Quới peninsula
		const map = L.map(mapContainer, {
			center: MAP_CENTER,
			zoom: DEFAULT_ZOOM,
			zoomControl: false,
			attributionControl: true,
			minZoom: 12,
			maxZoom: 19
		});
		mapInstance = map;

		// Add custom position zoom control
		L.control.zoom({ position: 'bottomright' }).addTo(map);

		// High-Res Satellite Imagery (Esri World Imagery)
		L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				maxZoom: 19,
				attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics'
			}
		).addTo(map);

		setTimeout(() => {
			map.invalidateSize();
		}, 300);
	});

	onDestroy(() => {
		if (mapInstance) {
			mapInstance.remove();
			mapInstance = null;
		}
	});
</script>

<div class="map-wrapper">
	<div bind:this={mapContainer} class="map-canvas"></div>

	<!-- Floating Map Controls -->
	<div class="map-quick-controls">
		<button class="ctrl-btn" onclick={resetToOverview} title="Đặt lại góc nhìn bán đảo">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ctrl-icon">
				<circle cx="12" cy="12" r="3" />
				<path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
			</svg>
			<span>Về trung tâm</span>
		</button>
	</div>

	<!-- Island Info Badge -->
	<div class="peninsula-badge">
		<div class="badge-dot"></div>
		<div class="badge-content">
			<span class="badge-title">Bán đảo Thanh Đa - Bình Quới</span>
			<span class="badge-coords">10°49'20.3"N 106°44'37.4"E • Vệ tinh</span>
		</div>
	</div>
</div>

<style>
	@layer components {
		.map-wrapper {
			position: absolute;
			inset: 0;
			overflow: hidden;
			container-type: inline-size;
			background: var(--color-bg);
		}

		/* Keeps Leaflet's internal z-indexes from competing with the overlays. */
		.map-canvas {
			block-size: 100%;
			isolation: isolate;
		}

		.map-quick-controls {
			position: absolute;
			inset-block-end: var(--space-page);
			inset-inline-start: var(--space-page);
			z-index: var(--z-map-overlay);
			display: flex;
			flex-wrap: wrap;
			gap: var(--space-xs);
		}

		.ctrl-btn {
			display: flex;
			align-items: center;
			gap: var(--space-xs);
			padding-block: var(--space-xs);
			padding-inline: var(--space-md);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-full);
			background: var(--color-surface);
			backdrop-filter: var(--blur-glass);
			box-shadow: var(--shadow-control);
			color: var(--color-text);
			font-size: var(--text-sm);
			font-weight: var(--weight-semibold);
			cursor: pointer;
			transition:
				background-color var(--duration-fast),
				border-color var(--duration-fast);
		}

		.ctrl-btn:hover {
			border-color: var(--color-accent-border);
			background: var(--color-surface-hover);
		}

		.ctrl-icon {
			inline-size: var(--size-icon);
			block-size: var(--size-icon);
		}

		.peninsula-badge {
			position: absolute;
			inset-block-start: var(--size-navbar-clearance);
			inset-inline-start: var(--space-page);
			z-index: var(--z-map-overlay);
			display: none;
			align-items: center;
			gap: var(--space-sm);
			padding-block: var(--space-xs);
			padding-inline: var(--space-md);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-md);
			background: var(--color-surface);
			backdrop-filter: var(--blur-glass);
			box-shadow: var(--shadow-panel);
			pointer-events: none;
		}

		.badge-dot {
			inline-size: var(--size-dot);
			block-size: var(--size-dot);
			border-radius: var(--radius-full);
			background: var(--color-success);
			box-shadow: var(--glow-success);
		}

		.badge-content {
			display: flex;
			flex-direction: column;
		}

		.badge-title {
			font-size: var(--text-md);
			font-weight: var(--weight-bold);
			letter-spacing: var(--tracking-snug);
		}

		.badge-coords {
			color: var(--color-text-muted);
			font-family: var(--font-mono);
			font-size: var(--text-xs);
		}

		@container (inline-size >= 40rem) {
			.peninsula-badge {
				display: flex;
			}
		}
	}
</style>
