<script>
	import Navbar from '#lib/components/Navbar.svelte';
	import BinhQuoiMap from '#lib/components/BinhQuoiMap.svelte';

	let mapComponent = $state(/** @type {any} */ (null));

	function handleResetView() {
		if (mapComponent && mapComponent.resetToOverview) {
			mapComponent.resetToOverview();
		}
	}
</script>

<div class="landing-page">
	<Navbar onResetView={handleResetView} />
	<BinhQuoiMap bind:this={mapComponent} />
</div>

<style>
	.landing-page {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #070b14;
	}
</style>
