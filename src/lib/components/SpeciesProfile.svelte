<script>
	import PhotoGallery from './PhotoGallery.svelte';

	/** @type {{ species: import('#lib/data/species.js').Species, onBack: () => void }} */
	let { species, onBack } = $props();

	const headingId = $props.id();
</script>

<article class="profile" aria-labelledby={headingId}>
	<button type="button" class="back" onclick={onBack}>
		<span aria-hidden="true">←</span> Quay lại
	</button>

	<header class="header">
		<!-- Focused on open, so screen readers start at the species' name. -->
		<h2
			class="name"
			id={headingId}
			tabindex="-1"
			{@attach (heading) => heading.focus({ preventScroll: true })}
		>
			{#if species.scientific && !species.altName}
				<em>{species.name}</em>
			{:else}
				{species.name}
			{/if}
		</h2>
		{#if species.altName}
			<p class="alt-name">
				{#if species.scientific}<em>{species.altName}</em>{:else}{species.altName}{/if}
				{#if species.author}<span class="author">{species.author}</span>{/if}
			</p>
		{/if}
		<p class="group">
			<span
				class="swatch species-mark shape-{species.style.shape}"
				style:--pin-color={species.style.color}
				aria-hidden="true"
			></span>
			{species.group} · {species.count} lần ghi nhận
		</p>
	</header>

	{#if species.photos.length > 0}
		<PhotoGallery photos={species.photos} />
	{/if}

	{#if species.text}
		<p class="text">{species.text}</p>
	{/if}
</article>

<style>
	@layer components {
		.profile {
			display: flex;
			flex-direction: column;
			gap: var(--space-md);
		}

		.back {
			align-self: flex-start;
			display: flex;
			align-items: center;
			gap: var(--space-2xs);
			min-block-size: var(--size-target-lg);
			padding-inline: var(--space-md);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-full);
			background: transparent;
			font-size: var(--text-base);
			font-weight: var(--weight-semibold);
			cursor: pointer;
			transition: background-color var(--duration-fast);
		}

		.back:hover {
			background: var(--color-surface-hover);
		}

		.header {
			display: flex;
			flex-direction: column;
			gap: var(--space-3xs);
		}

		.name {
			margin: 0;
			font-size: var(--text-title);
			font-weight: var(--weight-bold);
			line-height: var(--leading-snug);
		}

		.alt-name,
		.group {
			margin: 0;
			color: var(--color-text-muted);
			font-size: var(--text-base);
		}

		.author {
			font-weight: var(--weight-semibold);
		}

		.group {
			display: flex;
			align-items: center;
			gap: var(--space-xs);
		}

		.swatch {
			position: relative;
			flex: none;
			inline-size: var(--size-swatch);
			block-size: var(--size-swatch);
		}

		.text {
			margin: 0;
			font-size: var(--text-lead);
			line-height: var(--leading-normal);
		}
	}
</style>
