/**
 * How each species is drawn: shape from its group, colour from a palette shared
 * by pins and legend swatches. Colours are only distinct within a group.
 */

/**
 * @typedef {'circle' | 'square' | 'triangle'} SpeciesShape
 *
 * @typedef {Object} SpeciesStyle
 * @property {string} color a `--color-species-*` token, as a CSS value
 * @property {SpeciesShape} shape
 */

/** Matches the `--color-species-*` tokens in `app.css`. */
const PALETTE_SIZE = 10;

/** @type {Map<string, SpeciesShape>} */
const GROUP_SHAPES = new Map([
	['Chim', 'circle'],
	['Bò sát', 'square'],
	['Lưỡng cư', 'triangle']
]);

/**
 * Colours go to species in key order within each group, so they stay put when
 * sightings are reordered. Pass every sighting, so pins and legend get the same map.
 *
 * @param {{ species: string, group: string }[]} sightings
 * @returns {Map<string, SpeciesStyle>} keyed by species key
 */
export function speciesStyles(sightings) {
	/** @type {Map<string, Set<string>>} */
	const speciesByGroup = new Map();
	for (const { species, group } of sightings) {
		speciesByGroup.set(group, (speciesByGroup.get(group) ?? new Set()).add(species));
	}

	/** @type {Map<string, SpeciesStyle>} */
	const styles = new Map();
	for (const [group, species] of speciesByGroup) {
		const shape = GROUP_SHAPES.get(group) ?? 'circle';
		[...species].sort().forEach((key, index) => {
			styles.set(key, { color: `var(--color-species-${(index % PALETTE_SIZE) + 1})`, shape });
		});
	}
	return styles;
}
