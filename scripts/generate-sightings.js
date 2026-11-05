/**
 * Regenerates the map's pin data and web-ready photos from the private survey.
 * Run by hand after the survey changes: `npm run data:sightings`.
 */
import { glob, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import sharp from 'sharp';
import { buildSightingPins } from '../src/lib/data/sighting-pins.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const PHOTO_DIR = path.join(ROOT, 'src/lib/assets/sightings');
const PINS_FILE = path.join(ROOT, 'src/lib/data/sightings.generated.json');
const LONG_EDGE = 2000;

const rows = parse(await readFile(path.join(DATA_DIR, 'data.csv')), {
	bom: true,
	columns: true,
	skip_empty_lines: true
});

/** @type {string[]} */
const imageFiles = [];
for await (const file of glob('**/*.{jpg,jpeg}', { cwd: DATA_DIR })) imageFiles.push(file);
imageFiles.sort();

const { pins, photoCopies, report } = buildSightingPins(rows, imageFiles);

await mkdir(PHOTO_DIR, { recursive: true });
const keep = new Set(photoCopies.map((copy) => copy.file));
for (const existing of await readdir(PHOTO_DIR)) {
	if (!keep.has(existing)) await rm(path.join(PHOTO_DIR, existing));
}

for (const { source, file } of photoCopies) {
	// sharp drops metadata by default, so the EXIF orientation is applied first.
	await sharp(path.join(DATA_DIR, source))
		.rotate()
		.resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
		.jpeg({ quality: 85, mozjpeg: true })
		.toFile(path.join(PHOTO_DIR, file));
}

await writeFile(PINS_FILE, `${JSON.stringify(pins, null, '\t')}\n`);

const speciesCount = new Set(pins.map((pin) => `${pin.title} ${pin.subtitle ?? ''}`)).size;
console.log(`${pins.length} pins across ${speciesCount} species, ${photoCopies.length} photos`);
console.log(`\nVietnamese names taken from notes, check these (${report.namesFromNotes.length}):`);
for (const { species, name } of report.namesFromNotes) console.log(`  ${species}: ${name}`);
console.log(`\nUnplaced species (${report.unplacedSpecies.length}):`);
for (const species of report.unplacedSpecies) console.log(`  ${species}`);
console.log(`\nUnused photos (${report.unusedPhotos.length}):`);
for (const photo of report.unusedPhotos) console.log(`  ${photo}`);
console.log(`\nSkipped sightings (${report.skippedSightings.length}):`);
for (const { id, species } of report.skippedSightings) console.log(`  ${id}  ${species}`);
