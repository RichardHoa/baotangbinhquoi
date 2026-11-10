<script module>
	/** The docked column's starting share of the screen width, in percent. */
	export const DEFAULT_PANEL_WIDTH = 30;
</script>

<script>
	import { GROUPS } from '#lib/data/species.js';
	import SpeciesProfile from './SpeciesProfile.svelte';

	/** Bounds of the docked column's share of the screen width, in percent. */
	const MIN_WIDTH = 20;
	const MAX_WIDTH = 50;
	const KEY_STEP = 2;

	/** @typedef {import('#lib/data/species.js').Species} Species */

	/**
	 * @type {{
	 *   species: Species[],
	 *   selected: Species | undefined,
	 *   sightingCount: number,
	 *   dongVatOn: boolean,
	 *   open: boolean,
	 *   onToggleDongVat: () => void,
	 *   onSelect: (key: string) => void,
	 *   onBack: () => void,
	 *   width?: number,
	 *   element?: HTMLElement | null
	 * }}
	 */
	let {
		species,
		selected,
		sightingCount,
		dongVatOn,
		open = $bindable(),
		onToggleDongVat,
		onSelect,
		onBack,
		width = $bindable(DEFAULT_PANEL_WIDTH),
		element = $bindable(null)
	} = $props();

	const bodyId = $props.id();
	/** @type {number | null} */
	let dragPointer = null;

	/**
	 * @param {number} percent
	 */
	function setWidth(percent) {
		width = Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, percent)));
	}

	/**
	 * The panel sits on the right, so the left arrow widens it.
	 *
	 * @param {KeyboardEvent} event
	 */
	function resizeWithKeys(event) {
		const steps = {
			ArrowLeft: width + KEY_STEP,
			ArrowRight: width - KEY_STEP,
			Home: MIN_WIDTH,
			End: MAX_WIDTH
		};
		const next = steps[/** @type {keyof typeof steps} */ (event.key)];
		if (next === undefined) return;
		event.preventDefault();
		setWidth(next);
	}

	/**
	 * @param {PointerEvent} event
	 */
	function startDrag(event) {
		dragPointer = event.pointerId;
		/** @type {HTMLElement} */ (event.currentTarget).setPointerCapture?.(event.pointerId);
	}

	/**
	 * @param {PointerEvent} event
	 */
	function drag(event) {
		const row = element?.parentElement?.getBoundingClientRect();
		if (event.pointerId !== dragPointer || !row) return;
		setWidth(((row.right - event.clientX) / row.width) * 100);
	}

	function endDrag() {
		dragPointer = null;
	}

	let groups = $derived(
		GROUPS.map((group) => ({
			group,
			species: species.filter((entry) => entry.group === group)
		})).filter((entry) => entry.species.length > 0)
	);
</script>

<aside
	class={['panel', { open }]}
	aria-label="Chú giải bản đồ"
	style:--panel-share="{width}%"
	bind:this={element}
>
	{#if open}
		<!-- A window splitter: drag it, or focus it and use the arrow keys. A focusable
		     separator is interactive in ARIA, which Svelte's checks don't know. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
		<div
			class="resize-handle"
			role="separator"
			aria-orientation="vertical"
			aria-label="Đổi độ rộng chú giải"
			aria-valuemin={MIN_WIDTH}
			aria-valuemax={MAX_WIDTH}
			aria-valuenow={width}
			tabindex="0"
			onkeydown={resizeWithKeys}
			onpointerdown={startDrag}
			onpointermove={drag}
			onpointerup={endDrag}
			onpointercancel={endDrag}
		></div>
	{/if}
	<button
		type="button"
		class="panel-toggle"
		aria-expanded={open}
		aria-controls={bodyId}
		onclick={() => (open = !open)}
	>
		<span>Chú giải ({species.length} loài)</span>
		<span class="chevron" aria-hidden="true"></span>
	</button>

	<div class="body" id={bodyId} hidden={!open}>
		{#if selected}
			{#key selected.key}
				<SpeciesProfile species={selected} {onBack} />
			{/key}
		{:else}
			<button
				type="button"
				class={['category', 'dong-vat', { off: !dongVatOn }]}
				aria-pressed={dongVatOn}
				onclick={onToggleDongVat}
			>
				<span class="category-swatch"></span>
				<span class="category-label">Động vật</span>
				<span class="count">{sightingCount}</span>
			</button>

			{#each groups as { group, species: members }, index (group)}
				<section class="group">
					<h3 class="group-heading" id="{bodyId}-group-{index}">{group}</h3>
					<ul class="rows" aria-labelledby="{bodyId}-group-{index}">
						{#each members as entry (entry.key)}
							<li>
								<button
									type="button"
									class="row"
									data-species={entry.key}
									onclick={() => onSelect(entry.key)}
								>
									<span
										class="swatch species-mark shape-{entry.style.shape}"
										style:--pin-color={entry.style.color}
									></span>
									<span class="names">
										<span class={['name', { scientific: entry.scientific && !entry.altName }]}>
											{entry.name}
										</span>
										{#if entry.altName}
											<span class={['alt-name', { scientific: entry.scientific }]}>
												{entry.altName}
											</span>
										{/if}
									</span>
									<span class="count">
										{entry.count}<span class="sr-only"> lần ghi nhận</span>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				</section>
			{/each}

			<button type="button" class="category con-nguoi" disabled>
				<span class="category-swatch"></span>
				<span class="category-label">Con người</span>
				<span class="count">0</span>
				<span class="soon">sắp có</span>
			</button>
		{/if}
	</div>
</aside>

<style>
	@layer components {
		/* A bottom sheet on phones, collapsed to its toggle bar. */
		.panel {
			position: absolute;
			inset-inline: var(--space-page);
			inset-block-end: var(--space-page);
			z-index: var(--z-map-overlay);
			display: flex;
			flex-direction: column;
			max-block-size: var(--size-sheet-max);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-md);
			background: var(--color-panel);
			box-shadow: var(--shadow-panel);
		}

		/* Only the docked column can be resized. */
		.resize-handle {
			display: none;
		}

		.panel-toggle {
			display: flex;
			flex: none;
			align-items: center;
			justify-content: space-between;
			gap: var(--space-xs);
			min-block-size: var(--size-target-lg);
			padding-inline: var(--space-md);
			border: 0;
			border-radius: var(--radius-md);
			background: transparent;
			font-size: var(--text-lead);
			font-weight: var(--weight-bold);
			cursor: pointer;
		}

		.panel-toggle:hover {
			background: var(--color-surface-hover);
		}

		/* Points to where the panel will go: up to open the sheet, down to close it. */
		.chevron {
			inline-size: var(--size-dot);
			block-size: var(--size-dot);
			border-block-start: var(--border-swatch) solid currentColor;
			border-inline-start: var(--border-swatch) solid currentColor;
			rotate: 45deg;
			transition: rotate var(--duration-fast);
		}

		.open .chevron {
			rotate: 225deg;
		}

		.body {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--space-sm);
			overflow-y: auto;
			overscroll-behavior: contain;
			padding-block: var(--space-xs) var(--space-lg);
			padding-inline: var(--space-md);
		}

		.body[hidden] {
			display: none;
		}

		.category,
		.row {
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			inline-size: 100%;
			min-block-size: var(--size-target-lg);
			padding-inline: var(--space-xs);
			border: 0;
			border-radius: var(--radius-sm);
			background: transparent;
			text-align: start;
			cursor: pointer;
			transition: background-color var(--duration-fast);
		}

		.category:hover:not(:disabled),
		.row:hover {
			background: var(--color-surface-hover);
		}

		.category {
			font-size: var(--text-base);
			font-weight: var(--weight-semibold);
		}

		.category:disabled {
			color: var(--color-text-muted);
			cursor: not-allowed;
		}

		.category-swatch {
			flex: none;
			inline-size: var(--size-swatch);
			block-size: var(--size-swatch);
			border: var(--border-swatch) solid var(--color-pin-edge);
			border-radius: var(--radius-full);
			box-shadow: 0 0 0 var(--border-thin) var(--color-pin-outline);
			background: var(--swatch-color);
		}

		.dong-vat {
			--swatch-color: var(--color-category-dong-vat);
		}

		.con-nguoi {
			--swatch-color: var(--color-category-con-nguoi);
		}

		/* Hollow as well as dimmed, so the off state doesn't rely on colour alone. */
		.off {
			color: var(--color-text-muted);
		}

		.off .category-swatch {
			background: transparent;
		}

		.off .category-label {
			text-decoration: line-through;
		}

		.category-label,
		.names {
			flex: 1;
		}

		.count {
			color: var(--color-text-muted);
			font-family: var(--font-mono);
			font-size: var(--text-md);
		}

		.soon {
			padding-inline: var(--space-xs);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-sm);
			font-size: var(--text-sm);
		}

		.group {
			display: flex;
			flex-direction: column;
			gap: var(--space-2xs);
			padding-inline-start: var(--space-sm);
		}

		.group-heading {
			margin: 0;
			padding-inline: var(--space-xs);
			color: var(--color-text-muted);
			font-size: var(--text-sm);
			font-weight: var(--weight-bold);
			letter-spacing: var(--tracking-wide);
			text-transform: uppercase;
		}

		.rows {
			margin: 0;
			padding: 0;
			list-style: none;
		}

		.row {
			padding-block: var(--space-xs);
		}

		.swatch {
			position: relative;
			flex: none;
			inline-size: var(--size-swatch);
			block-size: var(--size-swatch);
		}

		.names {
			display: flex;
			flex-direction: column;
			gap: var(--space-3xs);
			line-height: var(--leading-snug);
		}

		.name {
			font-size: var(--text-base);
			font-weight: var(--weight-semibold);
		}

		.alt-name {
			color: var(--color-text-muted);
			font-size: var(--text-md);
		}

		.scientific {
			font-style: italic;
		}

		/* Docked as a full-height column beside the map, open on load. Collapsed, it
		   floats over the map's corner, below the navbar. */
		@container (inline-size >= 40rem) {
			.panel {
				position: relative;
				inset: auto;
				flex: none;
				inline-size: max(var(--size-panel-min), var(--panel-share));
				max-block-size: none;
				border-block: 0;
				border-inline-end: 0;
				border-radius: 0;
				box-shadow: none;
			}

			.panel-toggle {
				min-block-size: calc(var(--size-navbar-clearance) - var(--space-page));
				padding-block-start: var(--space-page);
				border-radius: 0;
				font-size: var(--text-title);
			}

			.panel:not(.open) {
				position: absolute;
				inset-block-start: var(--size-navbar-clearance);
				inset-inline-end: var(--space-page);
				inline-size: auto;
				border: var(--border-thin) solid var(--color-border);
				border-radius: var(--radius-md);
				box-shadow: var(--shadow-panel);
			}

			.panel:not(.open) .panel-toggle {
				min-block-size: var(--size-target-lg);
				padding-block-start: 0;
				border-radius: var(--radius-md);
				font-size: var(--text-lead);
			}

			/* Straddles the column's edge; the line inside shows on hover, focus and drag. */
			.resize-handle {
				position: absolute;
				inset-block: 0;
				inset-inline-start: calc(var(--size-resize-handle) / -2);
				z-index: 1;
				display: block;
				inline-size: var(--size-resize-handle);
				cursor: col-resize;
				touch-action: none;
			}

			.resize-handle::after {
				content: '';
				position: absolute;
				inset-block: 0;
				inset-inline-start: 50%;
				inline-size: var(--border-swatch);
				translate: -50% 0;
				background: transparent;
				transition: background-color var(--duration-fast);
			}

			.resize-handle:hover::after,
			.resize-handle:active::after,
			.resize-handle:focus-visible::after {
				background: var(--color-accent);
			}

			/* Points left to bring the column back, right to tuck it away. */
			.chevron {
				rotate: -45deg;
			}

			.open .chevron {
				rotate: 135deg;
			}

			.body {
				padding-inline: var(--space-lg);
			}
		}
	}
</style>
