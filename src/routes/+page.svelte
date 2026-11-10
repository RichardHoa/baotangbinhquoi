<script>
	import Navbar from '#lib/components/Navbar.svelte';
	import BinhQuoiMap from '#lib/components/BinhQuoiMap.svelte';
	import { DEFAULT_PANEL_WIDTH } from '#lib/components/SpeciesPanel.svelte';
	import { sightings } from '#lib/data/sightings.js';

	let mapComponent = $state(/** @type {any} */ (null));
	let panelOpen = $state(false);
	let panelWidth = $state(DEFAULT_PANEL_WIDTH);

	function handleResetView() {
		if (mapComponent && mapComponent.resetToOverview) {
			mapComponent.resetToOverview();
		}
	}
</script>

<div class={['landing-page', { 'panel-docked': panelOpen }]} style:--panel-share="{panelWidth}%">
	<Navbar onResetView={handleResetView} />
	<BinhQuoiMap bind:this={mapComponent} bind:panelOpen bind:panelWidth {sightings} />
</div>

<style>
	@layer components {
		.landing-page {
			position: relative;
			block-size: 100dvh;
			overflow: hidden;
		}

		/* Keeps the navbar over the map, clear of the docked species panel. */
		@media (width >= 40rem) {
			.panel-docked {
				--size-page-dock: max(var(--size-panel-min), var(--panel-share));
			}
		}
	}
</style>
