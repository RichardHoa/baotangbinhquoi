<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import { MAP_CENTER, DEFAULT_ZOOM, PENINSULA_BOUNDARY } from '#lib/data/binhquoi.js';

	let mapContainer = $state(/** @type {HTMLElement | null} */ (null));
	let mapInstance = $state(/** @type {any} */ (null));
	let isBoundaryVisible = $state(true);
	let boundaryLayer = $state(/** @type {any} */ (null));

	export function resetToOverview() {
		if (mapInstance) {
			mapInstance.flyTo(MAP_CENTER, DEFAULT_ZOOM, {
				duration: 1.2
			});
		}
	}

	export function toggleBoundary() {
		if (!mapInstance || !boundaryLayer) return;
		if (isBoundaryVisible) {
			mapInstance.removeLayer(boundaryLayer);
			isBoundaryVisible = false;
		} else {
			mapInstance.addLayer(boundaryLayer);
			isBoundaryVisible = true;
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

		// Subtle glowing perimeter along the Thanh Đa - Bình Quới peninsula
		boundaryLayer = L.polygon(PENINSULA_BOUNDARY, {
			color: '#38bdf8',
			weight: 2.5,
			opacity: 0.85,
			dashArray: '8, 6',
			fillColor: '#0284c7',
			fillOpacity: 0.08
		}).addTo(map);

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
		<button
			class="ctrl-btn {isBoundaryVisible ? 'active' : ''}"
			onclick={toggleBoundary}
			title={isBoundaryVisible ? 'Ẩn đường viền bán đảo' : 'Hiện đường viền bán đảo'}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ctrl-icon">
				<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
			</svg>
			<span>{isBoundaryVisible ? 'Ranh giới đảo: BẬT' : 'Ranh giới đảo: TẮT'}</span>
		</button>

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
	.map-wrapper {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #070b14;
	}

	.map-canvas {
		width: 100%;
		height: 100%;
	}

	/* Floating Controls */
	.map-quick-controls {
		position: absolute;
		bottom: 1.5rem;
		left: 1.5rem;
		z-index: 1000;
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.ctrl-btn {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.5rem 0.9rem;
		background: rgba(14, 22, 38, 0.82);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 9999px;
		color: #cbd5e1;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
		transition: all 0.2s;
	}

	.ctrl-btn:hover {
		color: #ffffff;
		background: rgba(30, 41, 59, 0.9);
		border-color: rgba(56, 189, 248, 0.4);
	}

	.ctrl-btn.active {
		border-color: #38bdf8;
		color: #38bdf8;
		background: rgba(14, 22, 38, 0.92);
		box-shadow: 0 0 15px rgba(56, 189, 248, 0.25);
	}

	.ctrl-icon {
		width: 15px;
		height: 15px;
	}

	/* Island Info Badge */
	.peninsula-badge {
		position: absolute;
		top: 5.5rem;
		left: 1.5rem;
		z-index: 990;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.5rem 0.9rem;
		background: rgba(11, 15, 23, 0.75);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
		pointer-events: none;
	}

	.badge-dot {
		width: 8px;
		height: 8px;
		border-radius: 9999px;
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
	}

	.badge-content {
		display: flex;
		flex-direction: column;
	}

	.badge-title {
		font-size: 0.82rem;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 0.02em;
	}

	.badge-coords {
		font-size: 0.68rem;
		color: #94a3b8;
		font-family: monospace;
	}

	@media (max-width: 640px) {
		.peninsula-badge {
			display: none;
		}
		.map-quick-controls {
			bottom: 1rem;
			left: 1rem;
		}
	}
</style>
