import { SPECIES_PROFILES } from './species-profiles.js';
import { speciesStyles } from './species-styles.js';

/** @typedef {import('./sighting-pins.js').Sighting} Sighting */

/**
 * @typedef {Object} Species
 * @property {string} key
 * @property {string} group
 * @property {string} name Vietnamese where known, else the survey title
 * @property {string} [altName] the English or scientific name shown below `name`
 * @property {boolean} scientific whether `altName` (or `name`, without one) is scientific
 * @property {string} [author]
 * @property {number} count sightings of the species
 * @property {Sighting['photos']} photos every photo across its sightings, once each
 * @property {string} [text]
 * @property {import('./species-styles.js').SpeciesStyle} style
 */

export const GROUPS = ['Chim', 'Bò sát', 'Lưỡng cư'];

/**
 * One entry per species, sorted by name, with its profile and the style its pins use.
 *
 * @param {Sighting[]} sightings
 * @returns {Species[]}
 */
export function summarizeSpecies(sightings) {
	const styles = speciesStyles(sightings);
	/** @type {Map<string, Species>} */
	const species = new Map();

	for (const sighting of sightings) {
		const existing = species.get(sighting.species);
		if (existing) {
			existing.count += 1;
			for (const photo of sighting.photos) {
				const seen = existing.photos.some(({ src, alt }) => src === photo.src && alt === photo.alt);
				if (!seen) existing.photos.push(photo);
			}
			continue;
		}

		const profile = SPECIES_PROFILES[sighting.species];
		const name = profile?.name ?? sighting.title;
		species.set(sighting.species, {
			key: sighting.species,
			group: sighting.group,
			name,
			altName: sighting.subtitle ?? (name === sighting.title ? undefined : sighting.title),
			scientific: Boolean(sighting.titleAuthor),
			author: sighting.titleAuthor,
			count: 1,
			photos: [...sighting.photos],
			text: profile?.text,
			style: styles.get(sighting.species) ?? { color: '', shape: 'circle' }
		});
	}

	return [...species.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}
