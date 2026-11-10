/**
 * Turns the raw survey into map pins. Pure, so it can be tested without the
 * private data folder; `scripts/generate-sightings.js` handles the file system.
 */

/**
 * @typedef {Record<string, string>} SurveyRow
 *
 * @typedef {Object} PinPhoto
 * @property {string} file clean filename of the web-ready copy
 * @property {string} alt
 * @property {string} [sex] `Đực` or `Cái`, where the filename gives it
 *
 * @typedef {Object} Pin
 * @property {string} id
 * @property {number} lat
 * @property {number} lng
 * @property {string} species stable key shared by every pin of one species
 * @property {string} group
 * @property {string} title
 * @property {string} [titleAuthor] set when the title is a scientific name
 * @property {string} [subtitle]
 * @property {string} date dd/mm/yyyy
 * @property {string} time HH:mm
 * @property {number} individuals
 * @property {string} [habitat]
 * @property {string} [behavior]
 * @property {string} [note]
 * @property {PinPhoto[]} photos
 *
 * @typedef {Omit<PinPhoto, 'file'> & { src: any }} LoadedPhoto src is an enhanced image or URL
 * @typedef {Omit<Pin, 'photos'> & { photos: LoadedPhoto[] }} Sighting a pin ready for the map
 *
 * @typedef {Object} SpeciesPhoto
 * @property {string} source path relative to the data folder
 * @property {string} species
 * @property {string} [sightingId] set on photos tied to one sighting
 * @property {string} [author]
 * @property {string} [vietnameseName]
 * @property {'male' | 'female'} [sex]
 * @property {string} [file] clean filename, set once the species' photos are known
 */

const LOTUS_PHOTO = 'binhquoi.birds (17)';

/** Spellings in the survey and bird filenames, mapped to the species' name. */
const NAME_CORRECTIONS = new Map([
	['Microhyla ninthuanensis', 'Microhyla ninhthuanensis'],
	['Pied Fantail', 'Sunda Pied Fantail'],
	['Plainprinia', 'Plain Prinia'],
	['Collaredkingfisher', 'Collared Kingfisher'],
	['Black-crowned Ngụt Heron', 'Black-crowned Night Heron'],
	['Van Hesselt_s Sunbird', "Van Hesselt's Sunbird"]
]);

const GROUP_LABELS = new Map([
	['Bird', 'Chim'],
	['Reptile', 'Bò sát'],
	['Amphibian', 'Lưỡng cư']
]);

const SEX_LABELS = {
	male: { label: 'Đực', alt: 'con đực' },
	female: { label: 'Cái', alt: 'con cái' }
};

/**
 * @param {string} name
 */
function correctName(name) {
	return NAME_CORRECTIONS.get(name) ?? name;
}

/**
 * @param {string} text
 */
function capitalize(text) {
	return text.charAt(0).toLocaleUpperCase('vi') + text.slice(1);
}

/**
 * @param {string} text
 */
function slugify(text) {
	return text
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/đ/gi, 'd')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * A name and its parenthesised alias each count: `Sả khoang cổ (Chéo chẹt)` gives three forms.
 *
 * @param {string} name
 */
function nameForms(name) {
	const lower = name.toLocaleLowerCase('vi');
	return [lower, ...lower.split(/[()]/).map((part) => part.trim())].filter(Boolean);
}

/**
 * Reptile and amphibian photos: `<Species> (<Author>)/<ID>.Photos.<time>.jpg`.
 *
 * @param {string} source
 * @param {string[]} parts
 * @param {string} base
 * @returns {SpeciesPhoto | null}
 */
function parseLinkedPhoto(source, parts, base) {
	const id = base.match(/^([0-9a-f]{8})\.Photos\./)?.[1];
	const folder = parts.at(-2)?.match(/^(.+?) (\(.+\))$/);
	if (!id || !folder) return null;
	return { source, species: folder[1], author: folder[2], sightingId: id };
}

/**
 * Bird photos: `<English>_<Vietnamese>.jpg`, `<Name>.21.8.jpeg`, `<Vietnamese> - <Scientific>.jpg`
 * or a Vietnamese name alone.
 *
 * @param {string} source
 * @param {string} base
 * @returns {SpeciesPhoto | null}
 */
function parseNamedPhoto(source, base) {
	if (base === LOTUS_PHOTO) return null;

	const sexMatch = base.match(/ \((male|female)\)$/);
	const sex = /** @type {'male' | 'female' | undefined} */ (sexMatch?.[1]);
	const name = base.slice(0, sexMatch?.index).replace(/\.\d+\.\d+$/, '');
	const sexField = sex && { sex };

	const dashed = name.split(' - ');
	if (dashed.length === 2) {
		return { source, species: dashed[1], vietnameseName: dashed[0], ...sexField };
	}

	// The last underscore: an English name can hold one, as in `Van Hesselt_s Sunbird`.
	const lastUnderscore = name.lastIndexOf('_');
	if (lastUnderscore === -1) return { source, species: correctName(name), ...sexField };
	return {
		source,
		species: correctName(name.slice(0, lastUnderscore)),
		vietnameseName: name.slice(lastUnderscore + 1),
		...sexField
	};
}

/**
 * @param {string} source
 * @returns {SpeciesPhoto | null}
 */
function parsePhoto(source) {
	const parts = source.normalize('NFC').split('/');
	const base = (parts.at(-1) ?? '').replace(/\.\w+$/, '');
	return parseLinkedPhoto(source, parts, base) ?? parseNamedPhoto(source, base);
}

/**
 * @param {SpeciesPhoto[]} photos all photos of one species
 */
function assignFilenames(photos) {
	const unlabelled = photos.filter((photo) => !photo.sightingId && !photo.sex);
	photos.forEach((photo) => {
		const suffix =
			photo.sightingId ??
			photo.sex ??
			(unlabelled.length > 1 ? String(unlabelled.indexOf(photo) + 1) : '');
		photo.file = `${slugify(`${photo.species} ${suffix}`)}.jpg`;
	});
}

/**
 * @param {SurveyRow} row
 * @param {string} species
 * @param {SpeciesPhoto[]} photos
 * @param {string | undefined} noteName Vietnamese name found in the species' notes
 * @returns {Pin}
 */
function toPin(row, species, photos, noteName) {
	const [lat, lng] = row.GPS.split(',').map(Number);
	const [month, day, year] = row.Date.split('/');
	const [hours, minutes] = row.Time.split(':');
	const author = photos.find((photo) => photo.author)?.author;
	const vietnameseName = photos.find((photo) => photo.vietnameseName)?.vietnameseName ?? noteName;

	const repeatedNames = new Set(
		[species, row['Name of species'], vietnameseName ?? ''].flatMap(nameForms)
	);
	const note = row.Note?.trim() ?? '';
	const speciesAlt =
		!author && vietnameseName ? `${capitalize(vietnameseName)}, ${species}` : species;

	/** @param {string} field */
	const capitalizedField = (field) => row[field]?.trim() && capitalize(row[field].trim());
	const habitat = capitalizedField('Habitat');
	const behavior = capitalizedField('Behavior');

	return {
		id: row.ID,
		lat,
		lng,
		species: slugify(species),
		group: GROUP_LABELS.get(row.Group) ?? row.Group,
		title: author ? species : capitalize(vietnameseName ?? species),
		...(author && { titleAuthor: author }),
		...(!author && vietnameseName && { subtitle: species }),
		date: `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`,
		time: `${hours.padStart(2, '0')}:${minutes}`,
		individuals: Number(row['No. of individuals']),
		...(habitat && { habitat }),
		...(behavior && { behavior }),
		...(note && !repeatedNames.has(note.toLocaleLowerCase('vi')) && { note: capitalize(note) }),
		photos: photos
			.filter((photo) => !photo.sightingId || photo.sightingId === row.ID)
			.map((photo) => ({
				file: /** @type {string} */ (photo.file),
				alt: photo.sex ? `${speciesAlt}, ${SEX_LABELS[photo.sex].alt}` : speciesAlt,
				...(photo.sex && { sex: SEX_LABELS[photo.sex].label })
			}))
	};
}

/**
 * @param {SurveyRow[]} rows
 * @param {string[]} imageFiles paths relative to the data folder
 */
export function buildSightingPins(rows, imageFiles) {
	const surveyIds = new Set(rows.map((row) => row.ID));
	/** @type {Map<string, SpeciesPhoto[]>} */
	const photosBySpecies = new Map();
	/** @type {Map<string, SpeciesPhoto>} */
	const photosBySighting = new Map();
	/** @type {string[]} */
	const unusedPhotos = [];

	for (const file of imageFiles) {
		const photo = parsePhoto(file);
		if (!photo || (photo.sightingId && !surveyIds.has(photo.sightingId))) {
			unusedPhotos.push(file);
			continue;
		}
		photosBySpecies.set(photo.species, [...(photosBySpecies.get(photo.species) ?? []), photo]);
		if (photo.sightingId) photosBySighting.set(photo.sightingId, photo);
	}
	photosBySpecies.forEach(assignFilenames);

	/** @param {SurveyRow} row */
	const speciesOf = (row) =>
		photosBySighting.get(row.ID)?.species ?? correctName(row['Name of species']);

	/** @type {Map<string, string>} */
	const noteNames = new Map();
	for (const row of rows) {
		const species = speciesOf(row);
		const note = row.Note?.trim();
		if (row.Group !== 'Bird' || !note || noteNames.has(species)) continue;
		if (!nameForms(species).includes(note.toLocaleLowerCase('vi'))) noteNames.set(species, note);
	}

	/** @type {Pin[]} */
	const pins = [];
	/** @type {{ id: string, species: string }[]} */
	const skippedSightings = [];
	/** @type {Set<string>} */
	const placedSpecies = new Set();
	/** @type {Map<string, string>} */
	const namesFromNotes = new Map();

	for (const row of rows) {
		const species = speciesOf(row);
		const photos = photosBySpecies.get(species);
		if (!photos) {
			skippedSightings.push({ id: row.ID, species: row['Name of species'] });
			continue;
		}
		placedSpecies.add(species);
		const noteName = noteNames.get(species);
		if (noteName && !photos.some((photo) => photo.vietnameseName)) {
			namesFromNotes.set(species, noteName);
		}
		pins.push(toPin(row, species, photos, noteName));
	}

	/** @type {string[]} */
	const unplacedSpecies = [];
	/** @type {{ source: string, file: string }[]} */
	const photoCopies = [];
	for (const [species, photos] of photosBySpecies) {
		if (placedSpecies.has(species)) {
			for (const { source, file } of photos) {
				photoCopies.push({ source, file: /** @type {string} */ (file) });
			}
		} else {
			unusedPhotos.push(...photos.map((photo) => photo.source));
			unplacedSpecies.push(species);
		}
	}

	return {
		pins,
		photoCopies,
		report: {
			unusedPhotos,
			skippedSightings,
			unplacedSpecies,
			namesFromNotes: [...namesFromNotes].map(([species, name]) => ({ species, name }))
		}
	};
}
