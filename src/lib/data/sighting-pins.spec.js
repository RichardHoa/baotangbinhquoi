import { describe, expect, it } from 'vitest';
import { buildSightingPins } from './sighting-pins.js';

/**
 * @param {Record<string, string>} overrides
 */
function row(overrides = {}) {
	return {
		ID: 'aaaa0001',
		GPS: '10.831341, 106.739358',
		Date: '10/19/2026',
		Time: '7:08:26',
		Group: 'Bird',
		'Name of species': 'Common Moorhen',
		'No. of individuals': '2',
		Habitat: 'đầm (sen, dương xỉ)',
		Behavior: 'Kiếm ăn',
		Photos: '',
		Note: '',
		...overrides
	};
}

const MOORHEN_PHOTO = '3. Chim /Common Moorhen_Trích ré (Kịch).jpg';

describe('buildSightingPins', () => {
	it('turns a sighting of a species with a photo into a pin at its GPS point', () => {
		const { pins } = buildSightingPins([row()], [MOORHEN_PHOTO]);

		expect(pins).toHaveLength(1);
		expect(pins[0]).toMatchObject({ id: 'aaaa0001', lat: 10.831341, lng: 106.739358 });
	});

	describe('matching sightings to photos', () => {
		it('skips and reports a sighting whose species has no photo', () => {
			const { pins, report } = buildSightingPins(
				[row({ ID: 'bbbb0001', 'Name of species': 'Zebra Dove' })],
				[MOORHEN_PHOTO]
			);

			expect(pins).toEqual([]);
			expect(report.skippedSightings).toEqual([{ id: 'bbbb0001', species: 'Zebra Dove' }]);
		});

		it('matches reptile and amphibian photos by the ID at the start of the filename', () => {
			const { pins } = buildSightingPins(
				[row({ ID: '304d5803', Group: 'Amphibian', 'Name of species': 'Some Other Label' })],
				['2026.10.31/Kaloula pulchra (Gray, 1831)/304d5803.Photos.131735.jpg']
			);

			expect(pins[0]).toMatchObject({ title: 'Kaloula pulchra', titleAuthor: '(Gray, 1831)' });
		});

		it('gives a pin to a sighting with no photo of its own when its species has one', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: '197b005a', Group: 'Reptile', 'Name of species': 'Hemidactylus frenatus' }),
					row({ ID: '1130713b', Group: 'Reptile', 'Name of species': 'Hemidactylus frenatus' })
				],
				['2026.10.31/Hemidactylus frenatus (Duméril & Bibron, 1836)/1130713b.Photos.154818.jpg']
			);

			expect(pins.map((pin) => pin.id)).toEqual(['197b005a', '1130713b']);
			expect(pins[0].titleAuthor).toBe('(Duméril & Bibron, 1836)');
		});

		it('corrects the misspelt Microhyla name', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: 'b4778638', Group: 'Amphibian', 'Name of species': 'Microhyla ninthuanensis' }),
					row({ ID: '58d36537', Group: 'Amphibian', 'Name of species': 'Microhyla ninhthuanensis' })
				],
				['2026.10.31/Microhyla ninhthuanensis (Hoang et al., 2021)/58d36537.Photos.151318.jpg']
			);

			expect(pins[0].title).toBe('Microhyla ninhthuanensis');
		});

		it.each([
			['Sunda Pied Fantail', '3. Chim /Pied Fantail_Rẻ quạt Java.jpeg'],
			['Plain Prinia', '3. Chim /Plainprinia.21.8.jpeg'],
			['Collared Kingfisher', '3. Chim /Collaredkingfisher.21.8.jpeg']
		])('matches %s to the differently named photo %s', (species, photo) => {
			const { pins } = buildSightingPins([row({ 'Name of species': species })], [photo]);

			expect(pins).toHaveLength(1);
		});

		it('matches a bird photo whose filename uses decomposed Unicode', () => {
			const { pins } = buildSightingPins([row()], [MOORHEN_PHOTO.normalize('NFD')]);

			expect(pins[0].title).toBe('Trích ré (Kịch)');
		});

		it('shows linked Calotes sp. sightings as Calotes cf. irawadi and drops the unlinked one', () => {
			const { pins, report } = buildSightingPins(
				[
					row({ ID: '5183587b', Group: 'Reptile', 'Name of species': 'Calotes sp.' }),
					row({ ID: '8694e99c', Group: 'Reptile', 'Name of species': 'Calotes sp.' })
				],
				['2026.10.31/Calotes cf. irawadi (Zug et al., 2006)/5183587b.Photos.140513.jpg']
			);

			expect(pins.map((pin) => pin.id)).toEqual(['5183587b']);
			expect(pins[0].title).toBe('Calotes cf. irawadi');
			expect(report.skippedSightings).toEqual([{ id: '8694e99c', species: 'Calotes sp.' }]);
		});
	});

	describe('species key', () => {
		it('gives pins of the same species the same key, and other species another', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: 'a' }),
					row({ ID: 'b' }),
					row({ ID: 'c', 'Name of species': 'Collared Kingfisher' })
				],
				[MOORHEN_PHOTO, '3. Chim /Collaredkingfisher.21.8.jpeg']
			);

			expect(pins.map((pin) => pin.species)).toEqual([
				'common-moorhen',
				'common-moorhen',
				'collared-kingfisher'
			]);
		});

		it('shares the key across sightings whose photos are tied to one sighting each', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: '304d5803', Group: 'Amphibian', 'Name of species': 'Kaloula pulchra' }),
					row({ ID: '7c631f97', Group: 'Amphibian', 'Name of species': 'Kaloula pulchra' }),
					row({ ID: '197b005a', Group: 'Reptile', 'Name of species': 'Hemidactylus frenatus' }),
					row({ ID: '1130713b', Group: 'Reptile', 'Name of species': 'Hemidactylus frenatus' })
				],
				[
					'2026.10.31/Kaloula pulchra (Gray, 1831)/304d5803.Photos.131735.jpg',
					'2026.10.31/Kaloula pulchra (Gray, 1831)/7c631f97.Photos.142250.jpg',
					'2026.10.31/Hemidactylus frenatus (Duméril & Bibron, 1836)/1130713b.Photos.154818.jpg'
				]
			);

			expect(pins.map((pin) => pin.species)).toEqual([
				'kaloula-pulchra',
				'kaloula-pulchra',
				'hemidactylus-frenatus',
				'hemidactylus-frenatus'
			]);
		});

		it('shares the key between the misspelt and correct Microhyla names', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: 'b4778638', Group: 'Amphibian', 'Name of species': 'Microhyla ninthuanensis' }),
					row({ ID: '58d36537', Group: 'Amphibian', 'Name of species': 'Microhyla ninhthuanensis' })
				],
				['2026.10.31/Microhyla ninhthuanensis (Hoang et al., 2021)/58d36537.Photos.151318.jpg']
			);

			expect(pins.map((pin) => pin.species)).toEqual([
				'microhyla-ninhthuanensis',
				'microhyla-ninhthuanensis'
			]);
		});
	});

	describe('photos that do not reach the map', () => {
		it.each([
			["Van Hesselt's Sunbird", '3. Chim /Van Hesselt_s Sunbird_Hút mật họng hồng.jpg'],
			['Black-crowned Night Heron', '3. Chim /Black-crowned Ngụt Heron_Vạc.jpg'],
			['Vành khuyên', '3. Chim /Vành khuyên.jpg'],
			['Calotes bachae', '3. Chim /Tắc ké - Calotes bachae.jpg']
		])('reports %s as an unplaced species', (species, photo) => {
			const { pins, report, photoCopies } = buildSightingPins([], [photo]);

			expect(pins).toEqual([]);
			expect(report.unplacedSpecies).toEqual([species]);
			expect(report.unusedPhotos).toEqual([photo]);
			expect(photoCopies).toEqual([]);
		});

		it('reports the lotus photo as unused without treating it as a species', () => {
			const lotus = '3. Chim /binhquoi.birds (17).jpg';
			const { report } = buildSightingPins([], [lotus]);

			expect(report.unusedPhotos).toEqual([lotus]);
			expect(report.unplacedSpecies).toEqual([]);
		});

		it('reports an ID-named photo whose ID is not in the survey', () => {
			const photo = '2026.10.31/Kaloula pulchra (Gray, 1831)/ffffffff.Photos.131735.jpg';
			const { report } = buildSightingPins([], [photo]);

			expect(report.unusedPhotos).toEqual([photo]);
		});

		it('keeps an ID-named photo missing from the survey out of its species gallery', () => {
			const stray = '2026.10.31/Kaloula pulchra (Gray, 1831)/ffffffff.Photos.131735.jpg';
			const own = '2026.10.31/Kaloula pulchra (Gray, 1831)/304d5803.Photos.142250.jpg';
			const { pins, report } = buildSightingPins(
				[row({ ID: '304d5803', Group: 'Amphibian', 'Name of species': 'Kaloula pulchra' })],
				[stray, own]
			);

			expect(pins[0].photos).toHaveLength(1);
			expect(report.unusedPhotos).toEqual([stray]);
		});
	});

	describe('popup fields', () => {
		it.each([
			['Bird', 'Chim'],
			['Reptile', 'Bò sát'],
			['Amphibian', 'Lưỡng cư']
		])('names the group %s as %s', (group, label) => {
			const { pins } = buildSightingPins([row({ Group: group })], [MOORHEN_PHOTO]);

			expect(pins[0].group).toBe(label);
		});

		it('parses month-first dates and shows them as dd/mm/yyyy', () => {
			const { pins } = buildSightingPins([row({ Date: '9/5/2026' })], [MOORHEN_PHOTO]);

			expect(pins[0].date).toBe('05/09/2026');
		});

		it('shows time without seconds', () => {
			const { pins } = buildSightingPins([row({ Time: '7:08:26' })], [MOORHEN_PHOTO]);

			expect(pins[0].time).toBe('07:08');
		});

		it('carries individuals, habitat and behaviour, capitalised', () => {
			const { pins } = buildSightingPins([row()], [MOORHEN_PHOTO]);

			expect(pins[0]).toMatchObject({
				individuals: 2,
				habitat: 'Đầm (sen, dương xỉ)',
				behavior: 'Kiếm ăn'
			});
		});

		it('leaves out empty fields and never carries the raw photo path', () => {
			const { pins } = buildSightingPins(
				[row({ Habitat: '', Behavior: ' ', Photos: 'Bird Records_Images/x.jpg' })],
				[MOORHEN_PHOTO]
			);

			expect(pins[0]).not.toHaveProperty('habitat');
			expect(pins[0]).not.toHaveProperty('behavior');
			expect(pins[0]).not.toHaveProperty('note');
			expect(JSON.stringify(pins[0])).not.toContain('Bird Records_Images');
		});

		it('keeps a note that adds information', () => {
			const { pins } = buildSightingPins([row({ Note: 'Ăn quả cây si' })], [MOORHEN_PHOTO]);

			expect(pins[0].note).toBe('Ăn quả cây si');
		});

		it.each([
			['the English name', 'common moorhen'],
			['the Vietnamese name', 'trích ré (kịch)'],
			['part of the Vietnamese name', 'kịch']
		])('drops a note that only repeats %s', (_, note) => {
			const { pins } = buildSightingPins([row({ Note: note })], [MOORHEN_PHOTO]);

			expect(pins[0]).not.toHaveProperty('note');
		});

		it('drops a note that repeats the survey label of a corrected species', () => {
			const { pins } = buildSightingPins(
				[
					row({
						ID: '5183587b',
						Group: 'Reptile',
						'Name of species': 'Calotes sp.',
						Note: 'Calotes sp.'
					})
				],
				['2026.10.31/Calotes cf. irawadi (Zug et al., 2006)/5183587b.Photos.140513.jpg']
			);

			expect(pins[0]).not.toHaveProperty('note');
		});
	});

	describe('names', () => {
		it('titles a bird by its Vietnamese name with the English name below', () => {
			const { pins } = buildSightingPins([row()], [MOORHEN_PHOTO]);

			expect(pins[0]).toMatchObject({ title: 'Trích ré (Kịch)', subtitle: 'Common Moorhen' });
		});

		it('takes the Vietnamese name from a note when the photo has none, on every pin', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: 'a', 'Name of species': 'Plain Prinia' }),
					row({ ID: 'b', 'Name of species': 'Plain Prinia', Note: 'chiền chiện bụng hung' })
				],
				['3. Chim /Plainprinia.21.8.jpeg']
			);

			expect(pins.map((pin) => pin.title)).toEqual([
				'Chiền chiện bụng hung',
				'Chiền chiện bụng hung'
			]);
			expect(pins[1]).not.toHaveProperty('note');
		});

		it('reports names taken from notes, since a note may not be a name at all', () => {
			const { report } = buildSightingPins(
				[row({ 'Name of species': 'Plain Prinia', Note: 'Ăn quả cây si' })],
				['3. Chim /Plainprinia.21.8.jpeg']
			);

			expect(report.namesFromNotes).toEqual([{ species: 'Plain Prinia', name: 'Ăn quả cây si' }]);
		});

		it('does not report a note name for a species whose photo already names it', () => {
			const { report } = buildSightingPins([row({ Note: 'Ăn quả cây si' })], [MOORHEN_PHOTO]);

			expect(report.namesFromNotes).toEqual([]);
		});

		it('does not take a note repeating the English name as the Vietnamese name', () => {
			const { pins } = buildSightingPins(
				[row({ 'Name of species': 'Plain Prinia', Note: 'plain prinia' })],
				['3. Chim /Plainprinia.21.8.jpeg']
			);

			expect(pins[0].title).toBe('Plain Prinia');
		});

		it('falls back to the English name alone', () => {
			const { pins } = buildSightingPins(
				[row({ 'Name of species': 'Plain Prinia' })],
				['3. Chim /Plainprinia.21.8.jpeg']
			);

			expect(pins[0].title).toBe('Plain Prinia');
			expect(pins[0]).not.toHaveProperty('subtitle');
		});
	});

	describe('gallery', () => {
		const KALOULA = '2026.10.31/Kaloula pulchra (Gray, 1831)';

		it('shows a pin only the photos tied to its own sighting', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: '304d5803', Group: 'Amphibian', 'Name of species': 'Kaloula pulchra' }),
					row({ ID: '7c631f97', Group: 'Amphibian', 'Name of species': 'Kaloula pulchra' })
				],
				[`${KALOULA}/304d5803.Photos.131735.jpg`, `${KALOULA}/7c631f97.Photos.142250.jpg`]
			);

			expect(pins[1].photos).toEqual([
				{ file: 'kaloula-pulchra-7c631f97.jpg', alt: 'Kaloula pulchra' }
			]);
		});

		it('leaves a sighting with no photo of its own without photos', () => {
			const { pins } = buildSightingPins(
				[
					row({ ID: '304d5803', Group: 'Amphibian', 'Name of species': 'Kaloula pulchra' }),
					row({ ID: '7c631f97', Group: 'Amphibian', 'Name of species': 'Kaloula pulchra' })
				],
				[`${KALOULA}/304d5803.Photos.131735.jpg`]
			);

			expect(pins[1].photos).toEqual([]);
		});

		it('shows a bird photo on every pin of the species its filename names', () => {
			const { pins } = buildSightingPins([row({ ID: 'a' }), row({ ID: 'b' })], [MOORHEN_PHOTO]);
			const photos = [{ file: 'common-moorhen.jpg', alt: 'Trích ré (Kịch), Common Moorhen' }];

			expect(pins.map((pin) => pin.photos)).toEqual([photos, photos]);
		});

		it('labels male and female where the filename gives them', () => {
			const { pins } = buildSightingPins(
				[row({ 'Name of species': 'Brown-throated Sunbird' })],
				[
					'3. Chim /Brown-throated Sunbird_Hút mật họng nâu (female).jpg',
					'3. Chim /Brown-throated Sunbird_Hút mật họng nâu (male).jpg'
				]
			);

			expect(pins[0].photos).toEqual([
				{
					file: 'brown-throated-sunbird-female.jpg',
					alt: 'Hút mật họng nâu, Brown-throated Sunbird, con cái',
					sex: 'Cái'
				},
				{
					file: 'brown-throated-sunbird-male.jpg',
					alt: 'Hút mật họng nâu, Brown-throated Sunbird, con đực',
					sex: 'Đực'
				}
			]);
		});

		it('gives several unlabelled photos of a species distinct clean filenames', () => {
			const { photoCopies } = buildSightingPins(
				[row({ 'Name of species': 'Collared Kingfisher' })],
				[
					'3. Chim /Collared Kingfisher_Sả khoang cổ (Chéo chẹt).jpg',
					'3. Chim /Collaredkingfisher.21.8.jpeg'
				]
			);

			expect(photoCopies).toEqual([
				{
					source: '3. Chim /Collared Kingfisher_Sả khoang cổ (Chéo chẹt).jpg',
					file: 'collared-kingfisher-1.jpg'
				},
				{ source: '3. Chim /Collaredkingfisher.21.8.jpeg', file: 'collared-kingfisher-2.jpg' }
			]);
		});

		it('copies a photo once even when many pins show it', () => {
			const { photoCopies } = buildSightingPins(
				[row({ ID: 'a' }), row({ ID: 'b' })],
				[MOORHEN_PHOTO]
			);

			expect(photoCopies).toEqual([{ source: MOORHEN_PHOTO, file: 'common-moorhen.jpg' }]);
		});
	});
});
