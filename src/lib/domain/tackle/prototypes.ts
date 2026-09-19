import { BrandCatalogue, type BrandName } from './brands';
import { PackSizes, type ReelItem, type RodItem, type TackleItem } from './tackleItem';

export type PrototypeItem = RodItem | ReelItem;

export interface PrototypeDesign {
	id: string;
	brand: BrandName;
	label: string;
	item: PrototypeItem;
}

export const PrototypesPerBrandPerFisheryYear = 2;
const NumberMarker = '-no-';
const NotForSale = 0;
const NoRatingNeeded = 0;

function base(brand: BrandName, id: string, label: string) {
	const profile = BrandCatalogue[brand];
	return { id, brand, tier: profile.tier, label, price: NotForSale, minimumRating: NoRatingNeeded, packQuantity: PackSizes.One };
}

function rodDesign(brand: BrandName, id: string, label: string, lengthFeet: 12 | 13): PrototypeDesign {
	const item: RodItem = { ...base(brand, id, label), kind: 'rod', rod: { testCurveLb: 3.25, lengthFeet, isFullDuplon: true } };
	return { id, brand, label, item };
}

function reelDesign(brand: BrandName, id: string, label: string): PrototypeDesign {
	const item: ReelItem = { ...base(brand, id, label), kind: 'reel', reel: 'prototype_11000' };
	return { id, brand, label, item };
}

export const PrototypeDesigns: PrototypeDesign[] = [
	rodDesign('blackmere', 'blackmere-prototype-rod', 'Blackmere Prototype', 12),
	reelDesign('ironwood', 'ironwood-prototype-reel', 'Ironwood 11000'),
	rodDesign('vellum_and_steel', 'vellum_and_steel-prototype-rod', 'Vellum & Steel Prototype', 13),
	reelDesign('halcyon', 'halcyon-prototype-reel', 'Halcyon 11000')
];

export function prototypeDesign(designId: string): PrototypeDesign | null {
	return PrototypeDesigns.find((design) => design.id === designId) ?? null;
}

export function prototypeItemId(designId: string, number: number) {
	return `${designId}${NumberMarker}${number}`;
}

export function isPrototypeItemId(itemId: string) {
	return itemId.includes(NumberMarker);
}

export function prototypeItem(itemId: string): TackleItem | null {
	const [designId, numberWords] = itemId.split(NumberMarker);
	const design = prototypeDesign(designId);
	if (!design || !numberWords) return null;
	return { ...design.item, id: itemId, label: `${design.label} No. ${Number(numberWords)}` };
}

export function isAPrototype(item: Pick<TackleItem, 'id'>) {
	return isPrototypeItemId(item.id);
}
