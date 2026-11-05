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

/** Far enough apart that they never cluster at the default zoom. */
const SPREAD = [
	sighting(),
	sighting({ id: 'aaaa0002', lat: 10.8135, lng: 106.7437, title: 'Di đá', subtitle: 'Munia' })
];

describe('BinhQuoiMap legend', () => {
	it('shows each category with its count', async () => {
		render(BinhQuoiMap, { sightings: SPREAD });

		await expect
			.element(page.getByRole('button', { name: /Động vật.*2/ }))
			.toHaveAttribute('aria-pressed', 'true');
	});

	it('shows Con người as disabled and coming soon, with no pins', async () => {
		render(BinhQuoiMap, { sightings: SPREAD });

		const entry = page.getByRole('button', { name: /Con người.*sắp có/ });
		await expect.element(entry).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Trích ré/ })).toBeVisible();
		expect(document.querySelectorAll('.sighting-pin')).toHaveLength(2);
	});

	it('hides and restores pins when Động vật is toggled', async () => {
		render(BinhQuoiMap, { sightings: SPREAD });
		const pin = page.getByRole('button', { name: /Trích ré/ });
		await expect.element(pin).toBeVisible();

		const toggle = page.getByRole('button', { name: /Động vật/ });
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
		await expect.element(pin).not.toBeInTheDocument();

		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
		await expect.element(pin).toBeVisible();
	});
});

describe('BinhQuoiMap popup', () => {
	async function openPopup(/** @type {Record<string, unknown>} */ overrides = {}) {
		render(BinhQuoiMap, { sightings: [sighting(overrides)] });
		await page.getByRole('button', { name: /, 19\/10\/2026/ }).click();
		return page.getByRole('dialog');
	}

	it('titles a bird with its Vietnamese name and the English name below', async () => {
		const popup = await openPopup();

		await expect.element(popup.getByRole('heading')).toHaveTextContent('Trích ré (Kịch)');
		await expect.element(popup.getByText('Common Moorhen')).toBeVisible();
	});

	it('titles a reptile with its scientific name and author', async () => {
		const popup = await openPopup({
			title: 'Kaloula pulchra',
			titleAuthor: '(Gray, 1831)',
			subtitle: undefined
		});

		await expect
			.element(popup.getByRole('heading'))
			.toHaveTextContent('Kaloula pulchra (Gray, 1831)');
	});

	it('shows every field the sighting has', async () => {
		const popup = await openPopup({
			habitat: 'Rừng dừa nước',
			behavior: 'Kiếm ăn',
			note: 'Ăn quả cây si'
		});

		for (const text of [
			'Chim',
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

	it('leaves out fields the sighting does not have, and never shows the ID', async () => {
		const popup = await openPopup();

		await expect.element(popup.getByText('Chim', { exact: true })).toBeVisible();
		await expect.element(popup.getByText('Sinh cảnh')).not.toBeInTheDocument();
		await expect.element(popup.getByText('Hành vi')).not.toBeInTheDocument();
		await expect.element(popup.getByText('Ghi chú')).not.toBeInTheDocument();
		await expect.element(popup.getByText('aaaa0001')).not.toBeInTheDocument();
	});

	it('shows the details without a gallery when the sighting has no photos', async () => {
		const popup = await openPopup({ photos: [] });

		await expect.element(popup.getByRole('heading')).toHaveTextContent('Trích ré (Kịch)');
		await expect
			.element(popup.getByRole('button', { name: /Xem toàn màn hình/ }))
			.not.toBeInTheDocument();
	});

	it('closes on Escape and returns focus to the pin', async () => {
		const popup = await openPopup();
		await expect.element(popup).toBeVisible();

		await userEvent.keyboard('{Escape}');

		await expect.element(popup).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /, 19\/10\/2026/ })).toHaveFocus();
	});

	it('opens from the keyboard and moves focus into the popup', async () => {
		render(BinhQuoiMap, { sightings: [sighting()] });
		const pin = page.getByRole('button', { name: /, 19\/10\/2026/ });
		await expect.element(pin).toBeVisible();

		pin.element().focus();
		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByRole('dialog')).toHaveFocus();
	});
});

describe('BinhQuoiMap gallery', () => {
	/** @param {string} alt @param {Record<string, unknown>} [rest] */
	const photo = (alt, rest = {}) => ({ src: PIXEL, alt, ...rest });
	const THREE = [photo('Ảnh một'), photo('Ảnh hai'), photo('Ảnh ba')];

	/** @param {unknown[]} photos */
	async function openGallery(photos) {
		render(BinhQuoiMap, { sightings: [sighting({ photos })] });
		await page.getByRole('button', { name: /, 19\/10\/2026/ }).click();
		return page.getByRole('dialog');
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

	it('opens full-screen and returns to the same popup and photo on close', async () => {
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

describe('BinhQuoiMap clusters', () => {
	const NEARBY = [
		sighting(),
		sighting({ id: 'aaaa0002', lat: 10.8243, lng: 106.7437, title: 'Di đá' })
	];

	it('groups nearby pins into a cluster with a count, which splits on zoom', async () => {
		render(BinhQuoiMap, { sightings: NEARBY });

		const cluster = page.getByRole('button', { name: 'Cụm 2 điểm' });
		await cluster.click();

		await expect.element(page.getByRole('button', { name: /Trích ré/ })).toBeVisible();
		await expect.element(page.getByRole('button', { name: /Di đá/ })).toBeVisible();
		await expect.element(cluster).not.toBeInTheDocument();
	});

	it('fans out pins on the same spot when their cluster is clicked', async () => {
		render(BinhQuoiMap, {
			sightings: [sighting(), sighting({ id: 'aaaa0002', title: 'Di đá' })]
		});

		await page.getByRole('button', { name: 'Cụm 2 điểm' }).click();

		await expect.element(page.getByRole('button', { name: /Trích ré/ })).toBeVisible();
		await expect.element(page.getByRole('button', { name: /Di đá/ })).toBeVisible();
	});
});
