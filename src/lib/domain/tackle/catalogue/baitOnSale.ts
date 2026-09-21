import { BaitCatalogue, BaitNames, type BaitName } from '../baits';
import { BaitBrandCatalogue, type BaitBrandName } from '../brands';
import { PackSizes, type BaitItem } from '../tackleItem';

interface BaitRange {
	brand: BaitBrandName;
	kinds: BaitName[];
	pricePerPack: number;
}

const Particles: BaitName[] = ['hemp', 'sweetcorn', 'tiger_nut'];
const Everything = BaitNames;
const Ranges: BaitRange[] = [
	{ brand: 'meadowmill', kinds: Everything, pricePerPack: 8 },
	{ brand: 'redclay', kinds: Everything, pricePerPack: 15 },
	{ brand: 'particle_works', kinds: Particles, pricePerPack: 12 },
	{ brand: 'nocturne', kinds: ['frozen_boilie', 'shelf_life_boilie', 'pop_up', 'wafter', 'shrimp'], pricePerPack: 32 },
	{ brand: 'stillwater_naturals', kinds: ['worm', 'maggot', 'shrimp', 'hemp', 'tiger_nut'], pricePerPack: 40 },
	{ brand: 'saltmarsh', kinds: ['frozen_boilie', 'pop_up', 'wafter', 'worm', 'shrimp'], pricePerPack: 70 }
];

export const BaitOnSale: BaitItem[] = Ranges.flatMap((range) => range.kinds.map((kind) => baitItem(range, kind)));

function baitItem(range: BaitRange, kind: BaitName): BaitItem {
	const brand = BaitBrandCatalogue[range.brand];
	const profile = BaitCatalogue[kind];
	return {
		id: `${range.brand}-bait-${kind}`,
		brand: range.brand,
		tier: brand.tier,
		label: `${brand.label} ${profile.label.toLowerCase()}`,
		price: range.pricePerPack,
		minimumRating: brand.minimumRating,
		packQuantity: PackSizes.Bait,
		kind: 'bait',
		bait: { kind, appealFactor: brand.appealFactor, keepsDays: profile.keepsDays }
	};
}
