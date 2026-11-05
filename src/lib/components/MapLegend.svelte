<script>
	/**
	 * @typedef {Object} LegendCategory
	 * @property {string} id
	 * @property {string} label
	 * @property {number} count
	 * @property {boolean} on
	 * @property {boolean} [soon] listed but not usable yet
	 */

	/** @type {{ categories: LegendCategory[], onToggle: (id: string) => void }} */
	let { categories, onToggle } = $props();
</script>

<ul class="legend" aria-label="Chú giải bản đồ">
	{#each categories as category (category.id)}
		<li>
			<button
				type="button"
				class={['entry', category.id, { off: !category.on }]}
				aria-pressed={category.soon ? undefined : category.on}
				disabled={category.soon}
				onclick={() => onToggle(category.id)}
			>
				<span class="swatch"></span>
				<span class="label">{category.label}</span>
				<span class="count">{category.count}</span>
				{#if category.soon}
					<span class="soon">sắp có</span>
				{/if}
			</button>
		</li>
	{/each}
</ul>

<style>
	@layer components {
		.legend {
			display: flex;
			flex-wrap: wrap;
			gap: var(--space-2xs);
			margin: 0;
			padding: var(--space-2xs);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-md);
			background: var(--color-surface);
			backdrop-filter: var(--blur-glass);
			box-shadow: var(--shadow-panel);
			list-style: none;
			pointer-events: auto;
		}

		.entry {
			display: flex;
			align-items: center;
			gap: var(--space-xs);
			inline-size: 100%;
			min-block-size: var(--size-target);
			padding-inline: var(--space-xs);
			border: 0;
			border-radius: var(--radius-sm);
			background: transparent;
			font-size: var(--text-sm);
			font-weight: var(--weight-semibold);
			cursor: pointer;
			transition: background-color var(--duration-fast);
		}

		.entry:hover:not(:disabled) {
			background: var(--color-surface-hover);
		}

		.entry:disabled {
			color: var(--color-text-muted);
			cursor: not-allowed;
		}

		.swatch {
			inline-size: var(--size-icon);
			block-size: var(--size-icon);
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
		.off:not(:disabled) {
			color: var(--color-text-muted);
		}

		.off:not(:disabled) .swatch {
			background: transparent;
		}

		.off:not(:disabled) .label {
			text-decoration: line-through;
		}

		.count {
			color: var(--color-text-muted);
			font-family: var(--font-mono);
			font-size: var(--text-xs);
		}

		.soon {
			padding-inline: var(--space-2xs);
			border: var(--border-thin) solid var(--color-border);
			border-radius: var(--radius-sm);
			font-size: var(--text-xs);
		}

		@container (inline-size >= 40rem) {
			.legend {
				flex-direction: column;
				align-self: flex-start;
			}
		}
	}
</style>
