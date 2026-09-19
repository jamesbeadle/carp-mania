import { BrandCatalogue, type BrandName } from '../brands';
import { ReelCatalogue, type ReelKind } from '../reels';
import { PackSizes, type ReelItem } from '../tackleItem';

interface ReelRange {
	brand: BrandName;
	kinds: ReelKind[];
	basePrice: number;
}

const KindPremium: Record<ReelKind, number> = { carp_small: 1, carp_large: 1.4, big_pit_entry: 2.2, big_pit_full: 3 };

const Ranges: ReelRange[] = [
	{ brand: 'bankside_basics', kinds: ['carp_small', 'carp_large'], basePrice: 45 },
	{ brand: 'marlow', kinds: ['carp_small', 'carp_large', 'big_pit_entry'], basePrice: 110 },
	{ brand: 'ironwood', kinds: ['big_pit_entry', 'big_pit_full'], basePrice: 260 },
	{ brand: 'blackmere', kinds: ['carp_large', 'big_pit_full'], basePrice: 520 }
];

export const ReelsOnSale: ReelItem[] = Ranges.flatMap((range) => range.kinds.map((kind) => reelItem(range, kind)));

function reelItem(range: ReelRange, kind: ReelKind): ReelItem {
	const brand = BrandCatalogue[range.brand];
	return {
		id: `${range.brand}-reel-${kind}`,
		brand: range.brand,
		tier: brand.tier,
		label: `${brand.label} ${ReelCatalogue[kind].label.toLowerCase()} ${ReelCatalogue[kind].spool}`,
		price: Math.round(range.basePrice * KindPremium[kind]),
		minimumRating: brand.minimumRating,
		packQuantity: PackSizes.One,
		kind: 'reel',
		reel: kind
	};
}
