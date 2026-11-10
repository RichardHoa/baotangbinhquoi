<script>
	import { onMount, onDestroy, mount, unmount, flushSync, untrack } from 'svelte';
	import { browser } from '$app/env';
	import { MAP_CENTER, DEFAULT_ZOOM } from '#lib/data/binhquoi.js';
	import { summarizeSpecies } from '#lib/data/species.js';
	import SpeciesPanel, { DEFAULT_PANEL_WIDTH } from './SpeciesPanel.svelte';
	import SightingPopup from './SightingPopup.svelte';

	/** @typedef {import('#lib/data/sighting-pins.js').Sighting} Sighting */

	/** @type {{ sightings?: Sighting[], panelOpen?: boolean, panelWidth?: number }} */
	let {
		sightings = [],
		panelOpen = $bindable(false),
		panelWidth = $bindable(DEFAULT_PANEL_WIDTH)
	} = $props();

	const PIN_SIZE = 14;
	const POPUP_WIDTH = 320;
	const POPUP_GUTTER = 16;
	// Leaflet's popup fade-out, so the content stays until the popup has gone
	const POPUP_FADE_MS = 200;
	// Keeps a species seen once from zooming in to a few roofs
	const FIT_MAX_ZOOM = 17;
	// Matches the panel's container query: a docked column from here, a bottom sheet below
	const WIDE_QUERY = '(min-width: 40rem)';
	const SELECTED_Z_OFFSET = 1000;

	let mapContainer = $state(/** @type {HTMLElement | null} */ (null));
	let mapInstance = $state(/** @type {any} */ (null));
	let leaflet = $state.raw(/** @type {any} */ (null));
	let dongVatLayer = $state.raw(/** @type {any} */ (null));
	let dongVatOn = $state(true);
	let destroyed = false;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let resizeTimer;
	/** @type {ResizeObserver | undefined} */
	let resizeObserver;
	let overlayStack = $state(/** @type {HTMLElement | null} */ (null));
	let panelElement = $state(/** @type {HTMLElement | null} */ (null));
	let selectedKey = $state(/** @type {string | null} */ (null));
	/** Where focus goes back to when the profile closes: a row's species key, or a pin. */
	let profileOpener = /** @type {{ row: string } | { pin: any } | null} */ (null);
	/** @type {{ pin: any, sighting: Sighting }[]} */
	let pins = [];

	let species = $derived(summarizeSpecies(sightings));
	let speciesByKey = $derived(new Map(species.map((entry) => [entry.key, entry])));
	let selected = $derived(selectedKey === null ? undefined : speciesByKey.get(selectedKey));

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
	 * The map's edges that the overlays leave clear, as Leaflet padding. The docked
	 * panel sits beside the map, so only the phone sheet covers part of it.
	 */
	function clearPadding() {
		const map = mapInstance.getContainer().getBoundingClientRect();
		const overlaysEnd = overlayStack?.getBoundingClientRect().bottom ?? map.top;
		let bottom = POPUP_GUTTER;
		if (panelElement && !matchMedia(WIDE_QUERY).matches) {
			bottom += map.bottom - panelElement.getBoundingClientRect().top;
		}
		return {
			topLeft: [POPUP_GUTTER, overlaysEnd - map.top + POPUP_GUTTER],
			bottomRight: [POPUP_GUTTER, bottom]
		};
	}

	function toggleDongVat() {
		if (!dongVatLayer) return;
		dongVatOn = !dongVatOn;
		if (dongVatOn) mapInstance.addLayer(dongVatLayer);
		else mapInstance.removeLayer(dongVatLayer);
	}

	/**
	 * @param {any} pin
	 * @param {string} key the pin's species
	 * @param {string | null} selection
	 */
	function highlight(pin, key, selection) {
		const isSelected = selection === key;
		pin.getElement()?.classList.toggle('dimmed', selection !== null && !isSelected);
		pin.setZIndexOffset(isSelected ? SELECTED_Z_OFFSET : 0);
	}

	/**
	 * Opens a species' profile from its row and fits the map to its pins.
	 *
	 * @param {string} key
	 */
	function selectFromList(key) {
		selectedKey = key;
		profileOpener = { row: key };
		flushSync();
		const latLngs = sightings.filter((s) => s.species === key).map((s) => [s.lat, s.lng]);
		if (!mapInstance || latLngs.length === 0) return;
		const padding = clearPadding();
		// Leaflet animates the fit from JS, out of reach of the CSS reduced-motion reset
		mapInstance.fitBounds(leaflet.latLngBounds(latLngs), {
			paddingTopLeft: padding.topLeft,
			paddingBottomRight: padding.bottomRight,
			maxZoom: FIT_MAX_ZOOM,
			animate: !prefersReducedMotion()
		});
	}

	/**
	 * Opens the profile of a pin's species, leaving the map where it is.
	 *
	 * @param {any} pin
	 * @param {string} key
	 */
	function selectFromPin(pin, key) {
		if (selectedKey !== key) profileOpener = { pin };
		selectedKey = key;
		panelOpen = true;
		flushSync();
	}

	/** Back to the species list, with no popup and no dimming. */
	function clearSelection() {
		if (selectedKey === null) return;
		const opener = profileOpener;
		profileOpener = null;
		mapInstance?.closePopup();
		selectedKey = null;
		flushSync();
		const target =
			opener && 'row' in opener
				? panelElement?.querySelector(`[data-species="${opener.row}"]`)
				: opener?.pin.getElement();
		/** @type {HTMLElement | null | undefined} */ (target)?.focus({ preventScroll: true });
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function clearOnEscape(event) {
		if (event.key === 'Escape') clearSelection();
	}

	/**
	 * @param {Sighting} sighting
	 */
	function createPin(sighting) {
		const style = speciesByKey.get(sighting.species)?.style;
		const pin = leaflet.marker([sighting.lat, sighting.lng], {
			icon: leaflet.divIcon({
				className: `sighting-pin species-mark shape-${style?.shape}`,
				iconSize: [PIN_SIZE, PIN_SIZE]
			}),
			title: `${sighting.title}, ${sighting.date}`
		});
		// divIcon takes no inline style, and Leaflet rebuilds the element on every add
		pin.on('add', () => {
			pin.getElement()?.style.setProperty('--pin-color', style?.color ?? '');
			highlight(pin, sighting.species, selectedKey);
		});
		pin.bindPopup('');

		/** @type {Record<string, any> | null} */
		let mountedPopup = null;
		pin.on('popupopen', (/** @type {any} */ event) => {
			selectFromPin(pin, sighting.species);

			const popup = event.popup;
			// Sized here, not at bind time, so a rotated phone gets the current measurements
			const width = Math.min(POPUP_WIDTH, mapInstance.getSize().x - POPUP_GUTTER * 3);
			const padding = clearPadding();
			popup.options.minWidth = popup.options.maxWidth = width;
			popup.options.autoPanPaddingTopLeft = padding.topLeft;
			popup.options.autoPanPaddingBottomRight = padding.bottomRight;

			const target = document.createElement('div');
			mountedPopup = mount(SightingPopup, { target, props: { sighting } });
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
		const layer = dongVatLayer;
		const current = sightings;
		// Adding a pin reads the selection, which must not rebuild every pin
		untrack(() => {
			layer.clearLayers();
			pins = current.map((sighting) => ({ pin: createPin(sighting), sighting }));
			for (const { pin } of pins) layer.addLayer(pin);
		});
	});

	$effect(() => {
		const selection = selectedKey;
		for (const { pin, sighting } of pins) highlight(pin, sighting.species, selection);
	});

	onMount(async () => {
		const container = mapContainer;
		if (!browser || !container) return;

		panelOpen = matchMedia(WIDE_QUERY).matches;

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
		// Pins and popups stop their clicks, so this is a click on empty map
		map.on('click', clearSelection);
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
		// Opening and collapsing the docked panel resizes the map
		resizeObserver = new ResizeObserver(() => map.invalidateSize());
		resizeObserver.observe(container);
	});

	onDestroy(() => {
		destroyed = true;
		clearTimeout(resizeTimer);
		resizeObserver?.disconnect();
		if (mapInstance) {
			// remove() leaves a zoom animation's end timer running, which then reads the
			// removed panes; marking the zoom done makes that timer a no-op
			mapInstance._animatingZoom = false;
			mapInstance.remove();
			mapInstance = null;
		}
	});
</script>

<svelte:window onkeydown={clearOnEscape} />

<div class="map-wrapper">
	<div class="map-area">
		<div bind:this={mapContainer} class="map-canvas"></div>

		<!-- Floating Map Controls -->
		<div class="map-quick-controls">
			<button class="ctrl-btn" onclick={resetToOverview} title="Đặt lại góc nhìn bán đảo">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="ctrl-icon"
				>
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
		</div>
	</div>

	<SpeciesPanel
		{species}
		{selected}
		sightingCount={sightings.length}
		{dongVatOn}
		bind:open={panelOpen}
		bind:width={panelWidth}
		bind:element={panelElement}
		onToggleDongVat={toggleDongVat}
		onSelect={selectFromList}
		onBack={clearSelection}
	/>
</div>

<style>
	@layer components {
		/* A row on wide screens: the map, then the docked panel beside it. */
		.map-wrapper {
			position: absolute;
			inset: 0;
			display: flex;
			overflow: hidden;
			container-type: inline-size;
			background: var(--color-bg);
		}

		/* The inset keeps the bottom controls above the collapsed sheet bar on phones. */
		.map-area {
			--map-inset-block-end: calc(var(--size-target-lg) + var(--space-page));

			position: relative;
			flex: 1;
			min-inline-size: 0;
			container-type: inline-size;
		}

		/* Keeps Leaflet's internal z-indexes from competing with the overlays. */
		.map-canvas {
			block-size: 100%;
			isolation: isolate;
		}

		.map-quick-controls {
			position: absolute;
			inset-block-end: calc(var(--space-page) + var(--map-inset-block-end));
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

		/* Lets the map keep its clicks in the gaps around the badge. */
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

		@container (inline-size >= 40rem) {
			.map-area {
				--map-inset-block-end: 0px;
			}
		}
	}
</style>
