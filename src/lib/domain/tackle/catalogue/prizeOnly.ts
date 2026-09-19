import { BaitBrandCatalogue, BrandCatalogue } from '../brands';
import { NeverStraightensLb } from '../hooks';
import type { BaitItem, HookItem, LineItem, TackleItem } from '../tackleItem';

export const PrizeItemIds = {
	HooksTin: 'vellum_and_steel-hook-hand_picked',
	BatchSpool: 'vellum_and_steel-line-batch-20-clear',
	BaitDrum: 'saltmarsh-bait-drum'
} as const;

export const PrizeQuantities = { HooksInTheTin: 25, SpoolMetres: 1200, BaitInTheDrum: 1500 } as const;
export const BaitDrum = { AppealFactor: 1.3, KeepsDays: 30 } as const;
const NeverSnapsLb = Number.POSITIVE_INFINITY;
const NotForSale = 0;
const NoRatingNeeded = 0;

const HooksTin: HookItem = {
	id: PrizeItemIds.HooksTin,
	brand: 'vellum_and_steel',
	tier: BrandCatalogue.vellum_and_steel.tier,
	label: 'A tin of hand-picked Vellum & Steel hooks, size 4',
	price: NotForSale,
	minimumRating: NoRatingNeeded,
	packQuantity: PrizeQuantities.HooksInTheTin,
	kind: 'hook',
	hook: { size: 4, finish: 'matt', barb: 'micro', straightensAboveLb: NeverStraightensLb, snapsAboveLb: NeverSnapsLb }
};

const BatchSpool: LineItem = {
	id: PrizeItemIds.BatchSpool,
	brand: 'vellum_and_steel',
	tier: BrandCatalogue.vellum_and_steel.tier,
	label: 'Vellum & Steel batch spool · 20 lb at 0.30 mm · 1200 m',
	price: NotForSale,
	minimumRating: NoRatingNeeded,
	packQuantity: PrizeQuantities.SpoolMetres,
	kind: 'line',
	line: { colour: 'clear', breakingStrainLb: 20, diameterMm: 0.3, spoolMetres: PrizeQuantities.SpoolMetres }
};

const DrumOfBait: BaitItem = {
	id: PrizeItemIds.BaitDrum,
	brand: 'saltmarsh',
	tier: BaitBrandCatalogue.saltmarsh.tier,
	label: 'A drum of Saltmarsh fishmeal — a season of it',
	price: NotForSale,
	minimumRating: NoRatingNeeded,
	packQuantity: PrizeQuantities.BaitInTheDrum,
	kind: 'bait',
	bait: { kind: 'frozen_boilie', appealFactor: BaitDrum.AppealFactor, keepsDays: BaitDrum.KeepsDays }
};

export const PrizeOnlyTackle: TackleItem[] = [HooksTin, BatchSpool, DrumOfBait];

export function isPrizeOnly(item: Pick<TackleItem, 'price'>) {
	return item.price === NotForSale;
}
