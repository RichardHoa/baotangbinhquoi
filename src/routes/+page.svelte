<script>
	import Navbar from '#lib/components/Navbar.svelte';
	import BinhQuoiMap from '#lib/components/BinhQuoiMap.svelte';
	import { sightings } from '#lib/data/sightings.js';

	let mapComponent = $state(/** @type {any} */ (null));

	function handleResetView() {
		if (mapComponent && mapComponent.resetToOverview) {
			mapComponent.resetToOverview();
		}
	}
</script>

<div class="landing-page">
	<Navbar onResetView={handleResetView} />
	<BinhQuoiMap bind:this={mapComponent} {sightings} />
</div>

<style>
	@layer components {
		.landing-page {
			position: relative;
			block-size: 100dvh;
			overflow: hidden;
		}
	}
</style>
