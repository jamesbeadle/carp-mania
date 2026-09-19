import type { BrandName } from '../brands';
import { BrandCatalogue } from '../brands';
import type { RodLengthFeet, TestCurveLb } from '../rods';
import { PackSizes, type RodItem } from '../tackleItem';

interface RodRange {
	brand: BrandName;
	basePrice: number;
	curves: TestCurveLb[];
	lengths: RodLengthFeet[];
	isFullDuplon: boolean;
}

const HeavierCurvePremium: Record<TestCurveLb, number> = {
	2.75: 1,
	3: 1.2,
	3.5: 1.5
};
const LengthPremium: Record<RodLengthFeet, number> = { 10: 1, 12: 1, 13: 1.15 };
const HeavyCurveRatingStep = 10;

const Ranges: RodRange[] = [
	{ brand: 'bankside_basics', basePrice: 60, curves: [2.75, 3], lengths: [12], isFullDuplon: false },
	{ brand: 'tench_and_sons', basePrice: 110, curves: [2.75, 3], lengths: [10, 12], isFullDuplon: true },
	{ brand: 'marlow', basePrice: 180, curves: [2.75, 3, 3.5], lengths: [10, 12, 13], isFullDuplon: false },
	{ brand: 'ironwood', basePrice: 420, curves: [3, 3.5], lengths: [12, 13], isFullDuplon: true },
	{ brand: 'blackmere', basePrice: 900, curves: [2.75, 3, 3.5], lengths: [10, 12, 13], isFullDuplon: true }
];

export const RodsOnSale: RodItem[] = Ranges.flatMap(rodsInRange);

function rodsInRange(range: RodRange): RodItem[] {
	const { curves, lengths } = range;
	return curves.flatMap((curve) => lengths.map((length) => rodItem(range, curve, length)));
}

function rodItem(range: RodRange, testCurveLb: TestCurveLb, lengthFeet: RodLengthFeet): RodItem {
	const brand = BrandCatalogue[range.brand];
	const isHeavy = testCurveLb === 3.5;
	return {
		id: `${range.brand}-rod-${testCurveLb}-${lengthFeet}`,
		brand: range.brand,
		tier: brand.tier,
		label: `${brand.label} ${lengthFeet} ft ${testCurveLb} lb`,
		price: Math.round(range.basePrice * HeavierCurvePremium[testCurveLb] * LengthPremium[lengthFeet]),
		minimumRating: brand.minimumRating + (isHeavy ? HeavyCurveRatingStep : 0),
		packQuantity: PackSizes.One,
		kind: 'rod',
		rod: { testCurveLb, lengthFeet, isFullDuplon: range.isFullDuplon }
	};
}
