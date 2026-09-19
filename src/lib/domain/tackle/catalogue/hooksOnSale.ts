import { BrandCatalogue, type BrandName } from '../brands';
import { BarbLabels, Barbs, HookFinishes, HookSizes, NeverStraightensLb, type Barb, type HookFinish, type HookSize } from '../hooks';
import { PackSizes, type HookItem } from '../tackleItem';

interface HookRange {
	brand: BrandName;
	straightensAboveLb: number;
	snapsAboveLb: number;
	pricePerPack: number;
}

const Ranges: HookRange[] = [
	{ brand: 'bankside_basics', straightensAboveLb: 28, snapsAboveLb: 40, pricePerPack: 4 },
	{ brand: 'tench_and_sons', straightensAboveLb: 34, snapsAboveLb: 48, pricePerPack: 5 },
	{ brand: 'marlow', straightensAboveLb: 42, snapsAboveLb: 58, pricePerPack: 7 },
	{ brand: 'quarryman', straightensAboveLb: NeverStraightensLb, snapsAboveLb: 60, pricePerPack: 9 },
	{ brand: 'halcyon', straightensAboveLb: 55, snapsAboveLb: 75, pricePerPack: 14 },
	{ brand: 'vellum_and_steel', straightensAboveLb: NeverStraightensLb, snapsAboveLb: 90, pricePerPack: 30 }
];

export const HooksOnSale: HookItem[] = Ranges.flatMap((range) =>
	HookSizes.flatMap((size) => Barbs.flatMap((barb) => HookFinishes.map((finish) => hookItem(range, size, barb, finish))))
);

function hookItem(range: HookRange, size: HookSize, barb: Barb, finish: HookFinish): HookItem {
	const brand = BrandCatalogue[range.brand];
	return {
		id: `${range.brand}-hook-${size}-${barb}-${finish}`,
		brand: range.brand,
		tier: brand.tier,
		label: `${brand.label} size ${size} ${BarbLabels[barb].toLowerCase()} ${finish}`,
		price: range.pricePerPack,
		minimumRating: brand.minimumRating,
		packQuantity: PackSizes.Hooks,
		kind: 'hook',
		hook: { size, finish, barb, straightensAboveLb: range.straightensAboveLb, snapsAboveLb: range.snapsAboveLb }
	};
}
