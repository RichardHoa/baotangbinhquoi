import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '#lib/styles/app.css';
import BinhQuoiMap from './BinhQuoiMap.svelte';

// One transparent pixel: photos are fixtures, never the real survey files.
const PIXEL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * @param {Record<string, unknown>} overrides
 */
function sighting(overrides = {}) {
	return {
		id: 'aaaa0001',
		lat: 10.8223,
		lng: 106.7437,
		species: 'common-moorhen',
		group: 'Chim',
		title: 'Trích ré (Kịch)',
		subtitle: 'Common Moorhen',
		date: '19/10/2026',
		time: '07:08',
		individuals: 2,
		photos: [{ src: PIXEL, alt: 'Trích ré (Kịch), Common Moorhen' }],
		...overrides
	};
}

const SPREAD = [
	sighting(),
	sighting({
		id: 'aaaa0002',
		lat: 10.8135,
		lng: 106.7437,
		species: 'scaly-breasted-munia',
		title: 'Di đá',
		subtitle: 'Munia'
	})
];

/** Wide enough for the side panel, which opens on load. */
async function renderWide(/** @type {ReturnType<typeof sighting>[]} */ sightings) {
	await page.viewport(1280, 800);
	render(BinhQuoiMap, { sightings });
}

const panel = () => page.getByRole('complementary', { name: 'Chú giải bản đồ' });

/** Pins are named `<title>, <date>`, which tells them apart from panel rows. */
const pinOf = (/** @type {string} */ title) =>
	page.getByRole('button', { name: new RegExp(`${title}.*, \\d{2}/\\d{2}/\\d{4}$`) });
const rowOf = (/** @type {string} */ name) =>
	panel().getByRole('button', { name: new RegExp(`^${name}`) });
const opacityOf = (/** @type {string} */ title) =>
	Number(getComputedStyle(pinOf(title).first().element()).opacity);

const KALOULA = sighting({
	id: 'bbbb0001',
	species: 'kaloula-pulchra',
	group: 'Lưỡng cư',
	title: 'Kaloula pulchra',
	titleAuthor: '(Gray, 1831)',
	subtitle: undefined
});

describe('BinhQuoiMap panel', () => {
	it('lists each species under its group with its names and count', async () => {
		await renderWide([
			...SPREAD,
			sighting({ id: 'aaaa0003', lat: 10.82 }),
			sighting({
				id: 'bbbb0001',
				species: 'kaloula-pulchra',
				group: 'Lưỡng cư',
				title: 'Kaloula pulchra',
				titleAuthor: '(Gray, 1831)',
				subtitle: undefined
			})
		]);

		const birds = panel().getByRole('list', { name: 'Chim' });
		await expect
			.element(birds.getByRole('button', { name: /Trích ré \(Kịch\).*Common Moorhen.*2/ }))
			.toBeVisible();
		await expect.element(birds.getByRole('button', { name: /Di đá.*Munia.*1/ })).toBeVisible();
		await expect
			.element(
				panel()
					.getByRole('list', { name: 'Lưỡng cư' })
					.getByRole('button', { name: /Ễnh ương.*Kaloula pulchra.*1/ })
			)
			.toBeVisible();
	});

	it('shows Con người as disabled and coming soon, and keeps only the badge top left', async () => {
		await renderWide(SPREAD);

		await expect.element(panel().getByRole('button', { name: /Con người.*sắp có/ })).toBeDisabled();
		await expect
			.element(page.getByRole('list', { name: 'Chú giải bản đồ' }))
			.not.toBeInTheDocument();
		await expect.element(pinOf('Di đá')).toBeVisible();
		expect(document.querySelectorAll('.sighting-pin')).toHaveLength(2);
	});

	it('hides and restores every pin when Động vật is toggled', async () => {
		await renderWide(SPREAD);
		const pin = pinOf('Trích ré');
		await expect.element(pin).toBeVisible();

		const toggle = panel().getByRole('button', { name: /Động vật.*2/ });
		await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
		await expect.element(pin).not.toBeInTheDocument();

		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
		await expect.element(pin).toBeVisible();
	});

	it("gives each row a swatch in its pins' shape", async () => {
		await renderWide([...SPREAD, KALOULA]);
		await expect.element(pinOf('Kaloula')).toBeInTheDocument();

		const swatch = rowOf('Ễnh ương').element().querySelector('.species-mark');
		expect(swatch?.classList).toContain('shape-triangle');
		expect(pinOf('Kaloula').element().classList).toContain('shape-triangle');
	});
});

describe('BinhQuoiMap species profile', () => {
	it('opens from a row with photos, names, group and text, and dims other species', async () => {
		await renderWide([
			sighting({ photos: [{ src: PIXEL, alt: 'Ảnh một' }] }),
			sighting({ id: 'aaaa0003', lat: 10.82, photos: [{ src: PIXEL, alt: 'Ảnh hai' }] }),
			SPREAD[1]
		]);

		await rowOf('Trích ré').click();

		const profile = panel().getByRole('article', { name: 'Trích ré (Kịch)' });
		await expect.element(profile.getByRole('heading', { level: 2 })).toHaveFocus();
		await expect.element(profile.getByText('Common Moorhen')).toBeVisible();
		await expect.element(profile.getByText(/Chim · 2 lần ghi nhận/)).toBeVisible();
		await expect.element(profile.getByText(/hồ sen/)).toBeVisible();
		await expect.element(profile.getByText('1 / 2')).toBeVisible();
		await expect.poll(() => opacityOf('Di đá')).toBeLessThan(1);
		expect(opacityOf('Trích ré')).toBe(1);
	});

	it('fits the map to the species opened from the list', async () => {
		const far = sighting({
			id: 'cccc0001',
			lat: 10.86,
			lng: 106.79,
			species: 'far',
			title: 'Xa xôi'
		});
		await renderWide([...SPREAD, far]);
		await expect.element(pinOf('Xa xôi')).not.toBeInViewport();

		await rowOf('Xa xôi').click();

		await expect.element(pinOf('Xa xôi')).toBeInViewport();
	});

	it('opens from a pin with a popup that has no gallery or title, without moving the map', async () => {
		await renderWide(SPREAD);
		const pin = pinOf('Trích ré');
		await expect.element(pin).toBeVisible();
		const before = pin.element().getBoundingClientRect();

		await pin.click();

		const popup = page.getByRole('group', { name: /19\/10\/2026/ });
		await expect.element(popup.getByText('07:08')).toBeVisible();
		await expect.element(popup.getByRole('heading')).not.toBeInTheDocument();
		await expect.element(popup.getByRole('img')).not.toBeInTheDocument();
		await expect.element(panel().getByRole('article', { name: 'Trích ré (Kịch)' })).toBeVisible();
		await expect.poll(() => opacityOf('Di đá')).toBeLessThan(1);
		const after = pin.element().getBoundingClientRect();
		expect([after.x, after.y]).toEqual([before.x, before.y]);
	});

	it('keeps the profile open when only the popup closes', async () => {
		await renderWide(SPREAD);
		await pinOf('Trích ré').click();
		const popup = page.getByRole('group', { name: /19\/10\/2026/ });
		await expect.element(popup).toBeVisible();

		await page.getByRole('button', { name: 'Close popup' }).click();

		await expect.element(popup).not.toBeInTheDocument();
		await expect.element(panel().getByRole('article')).toBeVisible();
	});

	it('switches straight to another species when its pin is clicked', async () => {
		await renderWide(SPREAD);
		await pinOf('Trích ré').click();
		await expect.element(panel().getByRole('article', { name: /Trích ré/ })).toBeVisible();

		await pinOf('Di đá').click();

		await expect.element(panel().getByRole('article', { name: 'Di đá' })).toBeVisible();
		await expect.poll(() => opacityOf('Trích ré')).toBeLessThan(1);
	});

	/** @type {[string, () => Promise<void>][]} */
	const WAYS_OUT = [
		[
			'Back',
			() =>
				panel()
					.getByRole('button', { name: /Quay lại/ })
					.click()
		],
		['Escape', () => userEvent.keyboard('{Escape}')],
		[
			'a click on empty map',
			() =>
				page
					.elementLocator(/** @type {Element} */ (document.querySelector('.leaflet-container')))
					.click({ position: { x: 40, y: 400 } })
		]
	];

	for (const [wayOut, leave] of WAYS_OUT) {
		it(`returns to the list on ${wayOut}, closing the popup and clearing the dimming`, async () => {
			await renderWide(SPREAD);
			await pinOf('Trích ré').click();
			await expect.element(page.getByRole('group', { name: /19\/10\/2026/ })).toBeVisible();
			await expect.poll(() => opacityOf('Di đá')).toBeLessThan(1);

			await leave();

			await expect.element(panel().getByRole('article')).not.toBeInTheDocument();
			await expect.element(rowOf('Di đá')).toBeVisible();
			await expect
				.element(page.getByRole('group', { name: /19\/10\/2026/ }))
				.not.toBeInTheDocument();
			await expect.poll(() => opacityOf('Di đá')).toBe(1);
		});
	}

	it('returns focus to the row the profile was opened from', async () => {
		await renderWide(SPREAD);
		await rowOf('Di đá').click();
		await expect.element(panel().getByRole('heading', { level: 2 })).toHaveFocus();

		await userEvent.keyboard('{Escape}');

		await expect.element(rowOf('Di đá')).toHaveFocus();
	});

	it('returns focus to the pin the profile was opened from', async () => {
		await renderWide(SPREAD);
		const pin = pinOf('Di đá');
		await expect.element(pin).toBeVisible();
		pin.element().focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(panel().getByRole('heading', { level: 2 })).toHaveFocus();

		await panel()
			.getByRole('button', { name: /Quay lại/ })
			.click();

		await expect.element(pin).toHaveFocus();
	});
});

describe('BinhQuoiMap panel layout', () => {
	it('starts as a collapsed bottom sheet on phones and opens on a pin tap', async () => {
		await page.viewport(390, 800);
		render(BinhQuoiMap, { sightings: SPREAD });
		const bar = page.getByRole('button', { name: 'Chú giải (2 loài)' });
		await expect.element(bar).toHaveAttribute('aria-expanded', 'false');
		await expect.element(rowOf('Di đá')).not.toBeInTheDocument();

		await pinOf('Trích ré').click();

		await expect.element(bar).toHaveAttribute('aria-expanded', 'true');
		await expect.element(panel().getByRole('article', { name: /Trích ré/ })).toBeVisible();
	});

	it('resizes the docked panel between a fifth and half of the screen', async () => {
		await renderWide(SPREAD);
		const handle = panel().getByRole('separator', { name: 'Đổi độ rộng chú giải' });
		await expect.element(handle).toHaveAttribute('aria-valuenow', '30');
		const before = panel().element().getBoundingClientRect().width;

		handle.element().focus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(handle).toHaveAttribute('aria-valuenow', '32');
		expect(panel().element().getBoundingClientRect().width).toBeGreaterThan(before);

		await userEvent.keyboard('{End}{ArrowLeft}');
		await expect.element(handle).toHaveAttribute('aria-valuenow', '50');
		await userEvent.keyboard('{Home}{ArrowRight}');
		await expect.element(handle).toHaveAttribute('aria-valuenow', '20');
	});

	it('resizes the docked panel by dragging its edge', async () => {
		await renderWide(SPREAD);
		const handle = panel().getByRole('separator', { name: 'Đổi độ rộng chú giải' });
		const { x, y, height } = handle.element().getBoundingClientRect();
		const drag = (/** @type {string} */ type, /** @type {number} */ clientX) =>
			handle
				.element()
				.dispatchEvent(
					new PointerEvent(type, { bubbles: true, pointerId: 1, clientX, clientY: y + height / 2 })
				);

		drag('pointerdown', x);
		drag('pointermove', 1280 * 0.6);
		drag('pointerup', 1280 * 0.6);

		await expect.element(handle).toHaveAttribute('aria-valuenow', '40');
	});

	it('starts open on wide screens and collapses', async () => {
		await renderWide(SPREAD);
		const toggle = page.getByRole('button', { name: 'Chú giải (2 loài)' });
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect.element(rowOf('Di đá')).toBeVisible();

		await toggle.click();

		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect.element(rowOf('Di đá')).not.toBeInTheDocument();
	});
});

describe('BinhQuoiMap popup', () => {
	async function openPopup(/** @type {Record<string, unknown>} */ overrides = {}) {
		await renderWide([sighting(overrides)]);
		await pinOf('Trích ré').click();
		return page.getByRole('group', { name: /19\/10\/2026/ });
	}

	it('shows every field the sighting has', async () => {
		const popup = await openPopup({
			habitat: 'Rừng dừa nước',
			behavior: 'Kiếm ăn',
			note: 'Ăn quả cây si'
		});

		for (const text of [
			'19/10/2026',
			'07:08',
			'2',
			'Rừng dừa nước',
			'Kiếm ăn',
			'10.822300, 106.743700',
			'Ăn quả cây si'
		]) {
			await expect.element(popup.getByText(text, { exact: true })).toBeVisible();
		}
	});

	it('leaves out fields the sighting does not have, and never shows the ID or group', async () => {
		const popup = await openPopup();

		await expect.element(popup.getByText('07:08', { exact: true })).toBeVisible();
		await expect.element(popup.getByText('Sinh cảnh')).not.toBeInTheDocument();
		await expect.element(popup.getByText('Hành vi')).not.toBeInTheDocument();
		await expect.element(popup.getByText('Ghi chú')).not.toBeInTheDocument();
		await expect.element(popup.getByText('Chim')).not.toBeInTheDocument();
		await expect.element(popup.getByText('aaaa0001')).not.toBeInTheDocument();
	});
});

describe('BinhQuoiMap profile names', () => {
	it('names a reptile in Vietnamese, with its scientific name and author below', async () => {
		await renderWide([KALOULA]);
		await rowOf('Ễnh ương').click();

		const profile = panel().getByRole('article', { name: 'Ễnh ương thường' });
		await expect.element(profile.getByText('Kaloula pulchra')).toBeVisible();
		await expect.element(profile.getByText('(Gray, 1831)')).toBeVisible();
		await expect.element(profile.getByText(/Lưỡng cư · 1 lần ghi nhận/)).toBeVisible();
	});

	it('shows the profile without a gallery when the species has no photos', async () => {
		await renderWide([sighting({ photos: [] })]);
		await rowOf('Trích ré').click();

		const profile = panel().getByRole('article');
		await expect.element(profile.getByRole('heading')).toHaveTextContent('Trích ré (Kịch)');
		await expect
			.element(profile.getByRole('button', { name: /Xem toàn màn hình/ }))
			.not.toBeInTheDocument();
	});
});

describe('BinhQuoiMap gallery', () => {
	/** @param {string} alt @param {Record<string, unknown>} [rest] */
	const photo = (alt, rest = {}) => ({ src: PIXEL, alt, ...rest });
	const THREE = [photo('Ảnh một'), photo('Ảnh hai'), photo('Ảnh ba')];

	/** @param {unknown[]} photos */
	async function openGallery(photos) {
		await renderWide([sighting({ photos })]);
		await rowOf('Trích ré').click();
		return panel().getByRole('article');
	}

	it('hides arrows and counter when the sighting has one photo', async () => {
		const popup = await openGallery([photo('Ảnh một')]);

		await expect.element(popup.getByRole('img', { name: 'Ảnh một' })).toBeVisible();
		await expect.element(popup.getByRole('button', { name: 'Ảnh sau' })).not.toBeInTheDocument();
		await expect.element(popup.getByText('1 / 1')).not.toBeInTheDocument();
	});

	it('moves through photos with arrows and a counter', async () => {
		const popup = await openGallery(THREE);
		await expect.element(popup.getByText('1 / 3')).toBeVisible();

		await popup.getByRole('button', { name: 'Ảnh sau' }).click();
		await expect.element(popup.getByText('2 / 3')).toBeVisible();
		await expect.element(popup.getByRole('img', { name: 'Ảnh hai' })).toBeVisible();

		await popup.getByRole('button', { name: 'Ảnh trước' }).click();
		await popup.getByRole('button', { name: 'Ảnh trước' }).click();
		await expect.element(popup.getByText('3 / 3')).toBeVisible();
	});

	it('moves with the arrow keys', async () => {
		const popup = await openGallery(THREE);

		popup.getByRole('button', { name: 'Ảnh sau' }).element().focus();
		await userEvent.keyboard('{ArrowRight}');

		await expect.element(popup.getByText('2 / 3')).toBeVisible();
	});

	it('keeps focus on the photo while moving with arrow keys, so Escape still works', async () => {
		const popup = await openGallery(THREE);
		const opener = popup.getByRole('button', { name: /Xem toàn màn hình/ });
		opener.element().focus();

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(opener).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(popup.getByText('3 / 3')).toBeVisible();

		await userEvent.keyboard('{Escape}');
		await expect.element(popup).not.toBeInTheDocument();
	});

	it('returns focus to the photo after moving inside the full-screen view', async () => {
		const popup = await openGallery(THREE);
		const opener = popup.getByRole('button', { name: /Xem toàn màn hình/ });
		await opener.click();
		await expect.element(page.getByRole('dialog', { name: 'Ảnh một' })).toBeVisible();

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('dialog', { name: 'Ảnh hai' })).toBeVisible();
		await userEvent.keyboard('{Escape}');

		await expect.element(page.getByRole('dialog', { name: 'Ảnh hai' })).not.toBeInTheDocument();
		await expect.element(opener).toHaveFocus();
	});

	it('moves on a horizontal touch swipe', async () => {
		const popup = await openGallery(THREE);
		const frame = popup.getByRole('button', { name: /Xem toàn màn hình/ }).element();
		const swipe = (/** @type {string} */ type, /** @type {number} */ clientX) =>
			frame.dispatchEvent(
				new PointerEvent(type, { bubbles: true, pointerType: 'touch', clientX, clientY: 100 })
			);

		swipe('pointerdown', 200);
		swipe('pointerup', 100);

		await expect.element(popup.getByText('2 / 3')).toBeVisible();
	});

	it('labels male and female photos', async () => {
		const popup = await openGallery([photo('Ảnh đực', { sex: 'Đực' })]);

		await expect.element(popup.getByText('Đực', { exact: true })).toBeVisible();
	});

	it('opens full-screen and returns to the same profile and photo on close', async () => {
		const popup = await openGallery(THREE);
		await popup.getByRole('button', { name: 'Ảnh sau' }).click();

		await popup.getByRole('button', { name: /Xem toàn màn hình/ }).click();
		const viewer = page.getByRole('dialog', { name: 'Ảnh hai' });
		await expect.element(viewer.getByRole('img', { name: 'Ảnh hai' })).toBeVisible();

		await viewer.getByRole('button', { name: 'Đóng' }).click();

		await expect.element(viewer).not.toBeInTheDocument();
		await expect.element(popup.getByText('2 / 3')).toBeVisible();
	});

	it('closes only the full-screen view on Escape, and moves with arrow keys inside it', async () => {
		const popup = await openGallery(THREE);
		await popup.getByRole('button', { name: /Xem toàn màn hình/ }).click();
		const viewer = page.getByRole('dialog', { name: 'Ảnh một' });
		await expect.element(viewer).toBeVisible();

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('dialog', { name: 'Ảnh hai' })).toBeVisible();

		await userEvent.keyboard('{Escape}');

		await expect.element(page.getByRole('dialog', { name: 'Ảnh hai' })).not.toBeInTheDocument();
		await expect.element(popup.getByText('2 / 3')).toBeVisible();
	});
});

describe('BinhQuoiMap pins', () => {
	const OVERLAPPING = [
		sighting(),
		sighting({ id: 'aaaa0002', lat: 10.8224, title: 'Di đá', species: 'scaly-breasted-munia' }),
		sighting({ id: 'aaaa0003', title: 'Chích bông nâu', species: 'ashy-tailorbird' })
	];

	/** Clicks a zoom button until Leaflet disables it at the zoom limit. */
	async function zoomToLimit(/** @type {'Zoom in' | 'Zoom out'} */ name) {
		const button = page.getByRole('button', { name });
		await expect
			.poll(
				async () => {
					if (button.element().getAttribute('aria-disabled') !== 'true') await button.click();
					return button.element().getAttribute('aria-disabled');
				},
				{ timeout: 10_000 }
			)
			.toBe('true');
	}

	async function expectOwnPinForEachSighting() {
		for (const title of ['Trích ré', 'Di đá', 'Chích bông nâu']) {
			await expect.element(pinOf(title)).toBeVisible();
		}
		expect(document.querySelectorAll('.sighting-pin')).toHaveLength(OVERLAPPING.length);
		expect(document.querySelectorAll('.marker-cluster, .sighting-cluster')).toHaveLength(0);
	}

	/** @param {string} title */
	const fillOf = (title) => getComputedStyle(pinOf(title).element(), '::after').backgroundColor;

	it('shapes each pin by its group and colours species apart within a group', async () => {
		await renderWide([
			...OVERLAPPING,
			sighting({ id: 'bbbb0001', title: 'Calotes', group: 'Bò sát', species: 'calotes' }),
			sighting({ id: 'bbbb0002', title: 'Kaloula', group: 'Lưỡng cư', species: 'kaloula' })
		]);
		await expect.element(pinOf('Kaloula')).toBeInTheDocument();

		expect(pinOf('Trích ré').element().classList).toContain('shape-circle');
		expect(pinOf('Calotes').element().classList).toContain('shape-square');
		expect(pinOf('Kaloula').element().classList).toContain('shape-triangle');
		expect(new Set(['Trích ré', 'Di đá', 'Chích bông nâu'].map(fillOf)).size).toBe(3);
	});

	it('gives every pin of one species the same colour', async () => {
		await renderWide([
			...OVERLAPPING,
			sighting({ id: 'aaaa0004', lat: 10.81, title: 'Trích ré lần hai' })
		]);
		await expect.element(pinOf('lần hai')).toBeInTheDocument();

		expect(fillOf('lần hai')).toBe(fillOf('Trích ré \\(Kịch\\)'));
	});

	it('draws every sighting as its own pin at the lowest zoom', async () => {
		await renderWide(OVERLAPPING);
		await expect.element(pinOf('Trích ré')).toBeVisible();

		await zoomToLimit('Zoom out');

		await expectOwnPinForEachSighting();
	});

	it('draws every sighting as its own pin at the highest zoom', async () => {
		await renderWide(OVERLAPPING);
		await expect.element(pinOf('Trích ré')).toBeVisible();

		await zoomToLimit('Zoom in');

		await expectOwnPinForEachSighting();
	});
});
