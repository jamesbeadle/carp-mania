import type { Shelf, TackleShelves } from '$lib/contracts/TackleShelves';
import { TierLabels } from '$lib/domain/tackle/brands';
import type { TackleKind } from '$lib/domain/tackle/kinds';
import { priceUnderSponsorship } from '$lib/domain/tackle/sponsorship';
import type { TackleItem } from '$lib/domain/tackle/tackleItem';

export const EveryBrand = 'all';
export type BrandChoice = typeof EveryBrand | Shelf['brand'];

export interface ItemOnShelf {
	item: TackleItem;
	shelf: Shelf;
	price: number;
}

export function shelvesStocking(shelves: Shelf[], kind: TackleKind): Shelf[] {
	return shelves.filter((shelf) => shelf.items.some((item) => item.kind === kind));
}

export function itemsOnShow(shelves: Shelf[], kind: TackleKind, brand: BrandChoice): ItemOnShelf[] {
	const chosen = shelvesStocking(shelves, kind).filter((shelf) => brand === EveryBrand || shelf.brand === brand);
	return chosen.flatMap((shelf) => shelf.items.filter((item) => item.kind === kind).map((item) => ({ item, shelf, price: priceOn(shelf, item) })));
}

export function priceOn(shelf: Shelf, item: TackleItem) {
	return shelf.isSponsored ? priceUnderSponsorship(item.price) : item.price;
}

export function canBuy(shelf: Shelf) {
	return shelf.isUnlocked && shelf.isStocked;
}

export function lockWordsFor(shelf: Shelf, counter: Pick<TackleShelves, 'stocksUpTo'>) {
	if (!shelf.isStocked) return `${TierLabels[shelf.tier]} tier — this counter stocks up to ${TierLabels[counter.stocksUpTo]}. Sold at a water whose shop reaches it.`;
	if (!shelf.isUnlocked) return `Unlocks at rating ${shelf.minimumRating}`;
	return null;
}

export function modelWordsOf(item: TackleItem, shelf: Pick<Shelf, 'label'>) {
	const prefix = `${shelf.label} `;
	return item.label.startsWith(prefix) ? item.label.slice(prefix.length) : item.label;
}

export function canAfford(shelf: Shelf, price: number, money: number) {
	return money + shelf.credit >= price;
}
