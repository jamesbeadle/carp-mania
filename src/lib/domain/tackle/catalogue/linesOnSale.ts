import { BrandCatalogue, type BrandName } from '../brands';
import { BreakingStrains, LineColourLabels, LineColours, SpoolSizes, type BreakingStrainLb, type LineColour } from '../lines';
import type { LineItem } from '../tackleItem';

interface LineRange {
	brand: BrandName;
	diameters: Record<BreakingStrainLb, number>;
	pricePerSpool: number;
	spoolMetres: number;
}

const HundredthsOfAMillimetre = 100;
const Ranges: LineRange[] = [
	lineRange('bankside_basics', [35, 40, 45, 50], 12, SpoolSizes.Standard),
	lineRange('tench_and_sons', [34, 38, 43, 47], 16, SpoolSizes.Standard),
	lineRange('marlow', [32, 36, 40, 44], 28, SpoolSizes.Standard),
	lineRange('halcyon', [30, 33, 36, 38], 55, SpoolSizes.Large),
	lineRange('vellum_and_steel', [28, 30, 33, 35], 120, SpoolSizes.Large)
];

function lineRange(brand: BrandName, hundredthsByStrain: number[], pricePerSpool: number, spoolMetres: number): LineRange {
	const entries = BreakingStrains.map((strain, index) => [strain, hundredthsByStrain[index] / HundredthsOfAMillimetre]);
	const diameters = Object.fromEntries(entries) as Record<BreakingStrainLb, number>;
	return { brand, diameters, pricePerSpool, spoolMetres };
}

export const LinesOnSale: LineItem[] = Ranges.flatMap((range) => BreakingStrains.flatMap((strain) => LineColours.map((colour) => lineItem(range, strain, colour))));

function lineItem(range: LineRange, breakingStrainLb: BreakingStrainLb, colour: LineColour): LineItem {
	const brand = BrandCatalogue[range.brand];
	const diameterMm = range.diameters[breakingStrainLb];
	return {
		id: `${range.brand}-line-${breakingStrainLb}-${colour}`,
		brand: range.brand,
		tier: brand.tier,
		label: `${brand.label} ${breakingStrainLb} lb ${LineColourLabels[colour].toLowerCase()} · ${diameterMm} mm · ${range.spoolMetres} m`,
		price: range.pricePerSpool,
		minimumRating: brand.minimumRating,
		packQuantity: range.spoolMetres,
		kind: 'line',
		line: { colour, breakingStrainLb, diameterMm, spoolMetres: range.spoolMetres }
	};
}
