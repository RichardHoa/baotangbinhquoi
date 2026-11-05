<script>
	import PhotoGallery from './PhotoGallery.svelte';

	/** @type {{ sighting: import('#lib/data/sighting-pins.js').Sighting, onclose: () => void }} */
	let { sighting, onclose } = $props();

	const titleId = $props.id();

	let fields = $derived(
		[
			['Nhóm', sighting.group],
			['Ngày', sighting.date],
			['Giờ', sighting.time],
			['Số cá thể', sighting.individuals],
			['Sinh cảnh', sighting.habitat],
			['Hành vi', sighting.behavior],
			['Tọa độ', `${sighting.lat.toFixed(6)}, ${sighting.lng.toFixed(6)}`],
			['Ghi chú', sighting.note]
		].filter(([, value]) => value !== undefined)
	);

	/**
	 * @param {KeyboardEvent} event
	 */
	function closeOnEscape(event) {
		if (event.key === 'Escape') onclose();
	}
</script>

<div
	class="popup"
	role="dialog"
	aria-labelledby={titleId}
	tabindex="-1"
	onkeydown={closeOnEscape}
	{@attach (element) => element.focus({ preventScroll: true })}
>
	{#if sighting.photos.length > 0}
		<PhotoGallery photos={sighting.photos} />
	{/if}

	<div class="body">
		<header>
			<h2 class="title" id={titleId}>
				{#if sighting.titleAuthor}
					<em>{sighting.title}</em> <span class="author">{sighting.titleAuthor}</span>
				{:else}
					{sighting.title}
				{/if}
			</h2>
			{#if sighting.subtitle}
				<p class="subtitle">{sighting.subtitle}</p>
			{/if}
		</header>

		<dl class="fields">
			{#each fields as [label, value] (label)}
				<dt class="field-label">{label}</dt>
				<dd class="field-value">{value}</dd>
			{/each}
		</dl>
	</div>
</div>

<style>
	@layer components {
		/* Scrolls inside the space left under the navbar and legend on short screens. */
		.popup {
			max-block-size: calc(100dvh - var(--size-popup-clearance));
			overflow-y: auto;
			border-radius: var(--radius-md);
		}

		.body {
			display: flex;
			flex-direction: column;
			gap: var(--space-xs);
			padding-block: var(--space-sm);
			padding-inline: var(--space-md);
		}

		.title {
			margin: 0;
			font-size: var(--text-lg);
			font-weight: var(--weight-bold);
			line-height: var(--leading-snug);
		}

		.author {
			color: var(--color-text-muted);
			font-size: var(--text-sm);
			font-weight: var(--weight-semibold);
		}

		.subtitle {
			margin: 0;
			color: var(--color-text-muted);
			font-size: var(--text-sm);
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
