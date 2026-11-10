<script>
	import { onMount, onDestroy, mount, unmount } from 'svelte';
	import { browser } from '$app/env';
	import { MAP_CENTER, DEFAULT_ZOOM } from '#lib/data/binhquoi.js';
	import { speciesStyles } from '#lib/data/species-styles.js';
	import MapLegend from './MapLegend.svelte';
	import SightingPopup from './SightingPopup.svelte';

	/** @typedef {import('#lib/data/sighting-pins.js').Sighting} Sighting */

	/** @type {{ sightings?: Sighting[] }} */
	let { sightings = [] } = $props();

	const PIN_SIZE = 14;
	const POPUP_WIDTH = 320;
	const POPUP_GUTTER = 16;
	// Leaflet's popup fade-out, so the content stays until the popup has gone
	const POPUP_FADE_MS = 200;

	let mapContainer = $state(/** @type {HTMLElement | null} */ (null));
	let mapInstance = $state(/** @type {any} */ (null));
	let leaflet = $state.raw(/** @type {any} */ (null));
	let dongVatLayer = $state.raw(/** @type {any} */ (null));
	let dongVatOn = $state(true);
	let destroyed = false;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let resizeTimer;
	let overlayStack = $state(/** @type {HTMLElement | null} */ (null));

	let styles = $derived(speciesStyles(sightings));

	let categories = $derived([
		{
			id: 'dong-vat',
			label: 'Động vật',
			count: sightings.length,
			on: dongVatOn
		},
		{
			id: 'con-nguoi',
			label: 'Con người',
			count: 0,
			on: false,
			soon: true
		}
	]);

	function prefersReducedMotion() {
		return matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	export function resetToOverview() {
		if (mapInstance) {
			// Leaflet animates flyTo from JS, out of reach of the CSS reduced-motion reset
			mapInstance.flyTo(MAP_CENTER, DEFAULT_ZOOM, {
				animate: !prefersReducedMotion(),
				duration: 1.2
			});
		}
	}

	/**
	 * @param {string} id
	 */
	function toggleCategory(id) {
		if (id !== 'dong-vat' || !dongVatLayer) return;
		dongVatOn = !dongVatOn;
		if (dongVatOn) mapInstance.addLayer(dongVatLayer);
		else mapInstance.removeLayer(dongVatLayer);
	}

	/**
	 * @param {Sighting} sighting
	 */
	function createPin(sighting) {
		const style = styles.get(sighting.species);
		const pin = leaflet.marker([sighting.lat, sighting.lng], {
			icon: leaflet.divIcon({
				className: `sighting-pin shape-${style?.shape}`,
				iconSize: [PIN_SIZE, PIN_SIZE]
			}),
			title: `${sighting.title}, ${sighting.date}`
		});
		// divIcon takes no inline style, and Leaflet rebuilds the element on every add
		pin.on('add', () => pin.getElement()?.style.setProperty('--pin-color', style?.color ?? ''));
		pin.bindPopup('');

		/** @type {Record<string, any> | null} */
		let mountedPopup = null;
		pin.on('popupopen', (/** @type {any} */ event) => {
			const popup = event.popup;
			// Sized here, not at bind time, so a rotated phone gets the current measurements
			const width = Math.min(POPUP_WIDTH, mapInstance.getSize().x - POPUP_GUTTER * 3);
			const overlaysEnd = overlayStack?.getBoundingClientRect().bottom ?? 0;
			popup.options.minWidth = popup.options.maxWidth = width;
			popup.options.autoPanPaddingTopLeft = [POPUP_GUTTER, overlaysEnd + POPUP_GUTTER];
			popup.options.autoPanPaddingBottomRight = [POPUP_GUTTER, POPUP_GUTTER];

			const target = document.createElement('div');
			mountedPopup = mount(SightingPopup, {
				target,
				props: { sighting, onclose: () => pin.closePopup() }
			});
			popup.setContent(target);
		});
		pin.on('popupclose', (/** @type {any} */ event) => {
			const active = document.activeElement;
			if (active === document.body || event.popup.getElement()?.contains(active)) {
				pin.getElement()?.focus({ preventScroll: true });
			}
			const closing = mountedPopup;
			mountedPopup = null;
			setTimeout(() => closing && unmount(closing), POPUP_FADE_MS);
		});
		return pin;
	}

	$effect(() => {
		if (!dongVatLayer) return;
		dongVatLayer.clearLayers();
		for (const sighting of sightings) dongVatLayer.addLayer(createPin(sighting));
	});

	onMount(async () => {
		const container = mapContainer;
		if (!browser || !container) return;

		// Dynamically import Leaflet to support SSR / Cloudflare Workers
		const L = (await import('leaflet')).default;
		if (destroyed) return;

		const reducedMotion = prefersReducedMotion();

		// Initialize Map centered on Bình Quới peninsula
		const map = L.map(container, {
			center: MAP_CENTER,
			zoom: DEFAULT_ZOOM,
			zoomControl: false,
			attributionControl: true,
			minZoom: 12,
			maxZoom: 19,
			zoomAnimation: !reducedMotion,
			markerZoomAnimation: !reducedMotion,
			fadeAnimation: !reducedMotion
		});
		if (reducedMotion) {
			// Popup auto-pan calls panBy with no options, so it can't be asked not to animate
			const panBy = map.panBy.bind(map);
			map.panBy = (/** @type {any} */ offset, /** @type {any} */ options) =>
				panBy(offset, { ...options, animate: false });
		}
		mapInstance = map;
		leaflet = L;
		dongVatLayer = L.layerGroup().addTo(map);

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

		resizeTimer = setTimeout(() => {
			map.invalidateSize();
		}, 300);
	});

	onDestroy(() => {
		destroyed = true;
		clearTimeout(resizeTimer);
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

	<div class="overlay-stack" bind:this={overlayStack}>
		<!-- Island Info Badge -->
		<div class="peninsula-badge">
			<div class="badge-dot"></div>
			<div class="badge-content">
				<span class="badge-title">Bán đảo Thanh Đa - Bình Quới</span>
				<span class="badge-coords">10°49'20.3"N 106°44'37.4"E • Vệ tinh</span>
			</div>
		</div>

		<MapLegend {categories} onToggle={toggleCategory} />
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

		/* Lets the map keep its clicks in the gaps around the badge and legend. */
		.overlay-stack {
			position: absolute;
			inset-block-start: var(--size-navbar-clearance);
			inset-inline-start: var(--space-page);
			z-index: var(--z-map-overlay);
			display: flex;
			flex-direction: column;
			gap: var(--space-xs);
			pointer-events: none;
		}

		.peninsula-badge {
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
