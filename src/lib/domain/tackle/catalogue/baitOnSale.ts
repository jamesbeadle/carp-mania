import { BaitCatalogue, BaitNames, type BaitName } from '../baits';
import { BaitBrandCatalogue, type BaitBrandName } from '../brands';
import { PackSizes, type BaitItem } from '../tackleItem';

interface BaitRange {
	brand: BaitBrandName;
	kinds: BaitName[];
	pricePerPack: number;
}

const Particles: BaitName[] = ['hemp', 'sweetcorn', 'particle'];
const Everything = BaitNames;
const Ranges: BaitRange[] = [
	{ brand: 'meadowmill', kinds: Everything, pricePerPack: 8 },
	{ brand: 'redclay', kinds: Everything, pricePerPack: 15 },
	{ brand: 'particle_works', kinds: Particles, pricePerPack: 12 },
	{ brand: 'nocturne', kinds: ['fishmeal_boilie', 'pop_up', 'shrimp'], pricePerPack: 32 },
	{ brand: 'saltmarsh', kinds: ['fishmeal_boilie', 'pop_up', 'worm', 'shrimp'], pricePerPack: 70 }
];
const KeepsForever = null;

export const BaitOnSale: BaitItem[] = Ranges.flatMap((range) => range.kinds.map((kind) => baitItem(range, kind)));

function baitItem(range: BaitRange, kind: BaitName): BaitItem {
	const brand = BaitBrandCatalogue[range.brand];
	return {
		id: `${range.brand}-bait-${kind}`,
		brand: range.brand,
		tier: brand.tier,
		label: `${brand.label} ${BaitCatalogue[kind].label.toLowerCase()}`,
		price: range.pricePerPack,
		minimumRating: brand.minimumRating,
		packQuantity: PackSizes.Bait,
		kind: 'bait',
		bait: { kind, appealFactor: brand.appealFactor, keepsDays: KeepsForever }
	};
}
