<script>
	/**
	 * @typedef {Object} GalleryPhoto
	 * @property {any} src an enhanced-img module, or a plain URL
	 * @property {string} alt
	 * @property {string} [sex]
	 */

	/** @type {{ photos: GalleryPhoto[] }} */
	let { photos } = $props();

	const SWIPE_DISTANCE = 40;

	let index = $state(0);
	let viewerOpen = $state(false);
	let viewer = $state(/** @type {HTMLDialogElement | null} */ (null));
	/** @type {{ x: number, y: number } | null} */
	let swipeStart = null;

	let photo = $derived(photos[index]);
	let hasMany = $derived(photos.length > 1);

	/**
	 * @param {number} step
	 */
	function move(step) {
		index = (index + step + photos.length) % photos.length;
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function moveOnArrowKey(event) {
		if (!hasMany) return;
		if (event.key === 'ArrowRight') move(1);
		if (event.key === 'ArrowLeft') move(-1);
	}

	/**
	 * @param {PointerEvent} event
	 */
	function startSwipe(event) {
		swipeStart = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
	}

	/**
	 * @param {PointerEvent} event
	 */
	function endSwipe(event) {
		if (!swipeStart || !hasMany) return;
		const dx = event.clientX - swipeStart.x;
		const dy = event.clientY - swipeStart.y;
		swipeStart = null;
		if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
	}

	/**
	 * Stops here so Escape closes only this view, not the profile around it.
	 *
	 * @param {KeyboardEvent} event
	 */
	function handleViewerKey(event) {
		event.stopPropagation();
		moveOnArrowKey(event);
	}

	/**
	 * @param {MouseEvent} event
	 */
	function closeOnBackdrop(event) {
		if (event.target === viewer) viewer?.close();
	}
</script>

{#snippet counter()}
	<span class="counter" aria-live="polite">{index + 1} / {photos.length}</span>
{/snippet}

{#snippet arrows()}
	<button type="button" class="arrow prev" aria-label="Ảnh trước" onclick={() => move(-1)}>
		<span aria-hidden="true">‹</span>
	</button>
	<button type="button" class="arrow next" aria-label="Ảnh sau" onclick={() => move(1)}>
		<span aria-hidden="true">›</span>
	</button>
{/snippet}

<figure class="gallery">
	<div class="frame">
		<!-- Only the image is keyed: the button holds focus, and is where the viewer returns it. -->
		<button
			type="button"
			class="open"
			aria-label="Xem toàn màn hình: {photo.alt}"
			onclick={() => (viewerOpen = true)}
			onkeydown={moveOnArrowKey}
			onpointerdown={startSwipe}
			onpointerup={endSwipe}
		>
			{#key index}
				<enhanced:img
					class="photo"
					src={photo.src}
					alt={photo.alt}
					sizes="(min-width: 40rem) min(30vw, 34rem), 100vw"
					loading="lazy"
				/>
			{/key}
		</button>
		{#if hasMany}
			<div class="controls" role="presentation" onkeydown={moveOnArrowKey}>
				{@render arrows()}
			</div>
			{@render counter()}
		{/if}
	</div>
	{#if photo.sex}
		<figcaption class="caption"><span class="sex">{photo.sex}</span></figcaption>
	{/if}
</figure>

{#if viewerOpen}
	<dialog
		bind:this={viewer}
		class="viewer"
		aria-label={photo.alt}
		{@attach (dialog) => dialog.showModal()}
		onclose={() => (viewerOpen = false)}
		onclick={closeOnBackdrop}
		onkeydown={handleViewerKey}
		onpointerdown={startSwipe}
		onpointerup={endSwipe}
	>
		<button type="button" class="close" onclick={() => viewer?.close()}>Đóng</button>
		{#key index}
			<enhanced:img class="viewer-photo" src={photo.src} alt={photo.alt} sizes="100vw" />
		{/key}
		{#if hasMany}
			{@render arrows()}
			{@render counter()}
		{/if}
		{#if photo.sex}
			<p class="viewer-caption"><span class="sex">{photo.sex}</span></p>
		{/if}
	</dialog>
{/if}

<style>
	@layer components {
		.gallery {
			margin: 0;
		}

		.frame {
			position: relative;
			aspect-ratio: var(--ratio-photo);
			overflow: hidden;
			border-radius: var(--radius-md);
			background: var(--color-scrim);
		}

		/* Leaves vertical drags to the browser, so panel scrolling still works. */
		.open {
			position: relative;
			display: block;
			inline-size: 100%;
			block-size: 100%;
			padding: 0;
			border: 0;
			background: transparent;
			cursor: zoom-in;
			touch-action: pan-y;
		}

		/* A light ring with a dark line inside it: one of the two always contrasts,
		   whatever the photo's brightness. */
		.open:focus-visible {
			--color-focus: var(--color-on-scrim);
		}

		.open:focus-visible::after {
			content: '';
			position: absolute;
			inset: var(--focus-width);
			border: var(--border-thin) solid var(--color-scrim);
		}

		/* These sit on fixed dark backdrops, where the theme's focus colour can fail. */
		.arrow,
		.close {
			--color-focus: var(--color-on-scrim);
		}

		.frame :global(picture),
		.viewer :global(picture) {
			display: contents;
		}

		.photo {
			display: block;
			inline-size: 100%;
			block-size: 100%;
			object-fit: contain;
		}

		.arrow {
			position: absolute;
			inset-block-start: 50%;
			translate: 0 -50%;
			display: grid;
			place-items: center;
			inline-size: var(--size-target);
			block-size: var(--size-target);
			padding: 0;
			border: 0;
			border-radius: var(--radius-full);
			background: var(--color-scrim-control);
			color: var(--color-on-scrim);
			font-size: var(--text-xl);
			line-height: var(--leading-none);
			cursor: pointer;
			transition: background-color var(--duration-fast);
		}

		.arrow:hover {
			background: var(--color-scrim-control-hover);
		}

		.prev {
			inset-inline-start: var(--space-xs);
		}

		.next {
			inset-inline-end: var(--space-xs);
		}

		.counter {
			position: absolute;
			inset-block-end: var(--space-xs);
			inset-inline-end: var(--space-xs);
			padding-inline: var(--space-xs);
			border-radius: var(--radius-full);
			background: var(--color-scrim-control);
			color: var(--color-on-scrim);
			font-family: var(--font-mono);
			font-size: var(--text-xs);
		}

		.caption {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--space-xs);
			padding-block-start: var(--space-xs);
			padding-inline: var(--space-md);
			color: var(--color-text-muted);
			font-size: var(--text-xs);
		}

		.sex {
			padding-inline: var(--space-xs);
			border: var(--border-thin) solid currentColor;
			border-radius: var(--radius-full);
			font-weight: var(--weight-semibold);
		}

		.viewer {
			inline-size: 100dvw;
			max-inline-size: 100dvw;
			block-size: 100dvh;
			max-block-size: 100dvh;
			margin: 0;
			padding: 0;
			border: 0;
			background: var(--color-scrim);
			color: var(--color-on-scrim);
			touch-action: pan-y;
		}

		.viewer::backdrop {
			background: var(--color-scrim);
		}

		.viewer-photo {
			display: block;
			inline-size: 100%;
			block-size: 100%;
			object-fit: contain;
		}

		.close {
			position: absolute;
			inset-block-start: var(--space-page);
			inset-inline-end: var(--space-page);
			z-index: 1;
			min-block-size: var(--size-target);
			padding-inline: var(--space-md);
			border: 0;
			border-radius: var(--radius-full);
			background: var(--color-scrim-control);
			color: var(--color-on-scrim);
			font-size: var(--text-md);
			font-weight: var(--weight-semibold);
			cursor: pointer;
		}

		.close:hover {
			background: var(--color-scrim-control-hover);
		}

		.viewer-caption {
			position: absolute;
			inset-block-end: var(--space-page);
			inset-inline-start: var(--space-page);
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--space-xs);
			margin: 0;
			padding-block: var(--space-2xs);
			padding-inline: var(--space-xs);
			border-radius: var(--radius-sm);
			background: var(--color-scrim-control);
			color: var(--color-on-scrim-muted);
			font-size: var(--text-sm);
		}
	}
</style>
