<script>
	/** @type {{ sighting: import('#lib/data/sighting-pins.js').Sighting }} */
	let { sighting } = $props();

	let fields = $derived(
		[
			['Ngày', sighting.date],
			['Giờ', sighting.time],
			['Số cá thể', sighting.individuals],
			['Sinh cảnh', sighting.habitat],
			['Hành vi', sighting.behavior],
			['Tọa độ', `${sighting.lat.toFixed(6)}, ${sighting.lng.toFixed(6)}`],
			['Ghi chú', sighting.note]
		].filter(([, value]) => value !== undefined)
	);
</script>

<!-- Only this sighting's details: its photos, names and group are in the species profile. -->
<div class="popup" role="group" aria-label="Lần ghi nhận ngày {sighting.date}">
	<dl class="fields">
		{#each fields as [label, value] (label)}
			<dt class="field-label">{label}</dt>
			<dd class="field-value">{value}</dd>
		{/each}
	</dl>
</div>

<style>
	@layer components {
		/* Scrolls inside the space left under the navbar on short screens. */
		.popup {
			max-block-size: calc(100dvh - var(--size-popup-clearance));
			overflow-y: auto;
			padding-block: var(--space-sm);
			padding-inline: var(--space-md) calc(var(--size-target) + var(--space-2xs));
		}

		.fields {
			display: grid;
			grid-template-columns: auto 1fr;
			gap: var(--space-2xs) var(--space-sm);
			margin: 0;
			font-size: var(--text-sm);
		}

		.field-label {
			color: var(--color-text-muted);
		}

		.field-value {
			margin: 0;
			font-weight: var(--weight-semibold);
		}
	}
</style>
