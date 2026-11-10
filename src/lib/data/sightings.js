import pins from './sightings.generated.json';

/** Widths for the profile gallery (up to 34rem, at up to 2x) and the full-screen view. */
const photoModules = import.meta.glob('../assets/sightings/*.jpg', {
	eager: true,
	query: { enhanced: true, w: '1920;1280;640' }
});

/**
 * @param {string} file
 */
function photoSource(file) {
	const module = /** @type {{ default: unknown } | undefined} */ (
		photoModules[`../assets/sightings/${file}`]
	);
	if (!module) throw new Error(`Missing species photo: ${file}. Run npm run data:sightings.`);
	return module.default;
}

/** The generated pins, with each photo's filename swapped for its enhanced image. */
export const sightings = pins.map((pin) => ({
	...pin,
	photos: pin.photos.map(({ file, ...photo }) => ({ ...photo, src: photoSource(file) }))
}));
