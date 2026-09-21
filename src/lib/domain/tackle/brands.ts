export type Tier = 'starter' | 'club' | 'specialist' | 'custom';
export type BrandName = 'bankside_basics' | 'tench_and_sons' | 'marlow' | 'quarryman' | 'fenwater' | 'halcyon' | 'ironwood' | 'north_ridge' | 'blackmere' | 'vellum_and_steel' | 'silvermere';
export type BaitBrandName = 'meadowmill' | 'redclay' | 'particle_works' | 'nocturne' | 'stillwater_naturals' | 'saltmarsh';

export interface Brand {
	label: string;
	tier: Tier;
	minimumRating: number;
	story: string;
}

export const Tiers: Tier[] = ['starter', 'club', 'specialist', 'custom'];
export const TierLabels: Record<Tier, string> = { starter: 'Starter', club: 'Club', specialist: 'Specialist', custom: 'Custom' };
export const TierRank: Record<Tier, number> = { starter: 0, club: 1, specialist: 2, custom: 3 };
export const WorldShopStocksUpTo: Tier = 'specialist';

export const BrandCatalogue: Record<BrandName, Brand> = {
	bankside_basics: { label: 'Bankside Basics', tier: 'starter', minimumRating: 0, story: 'Supermarket tackle. It works, just about.' },
	tench_and_sons: { label: 'Tench & Sons', tier: 'starter', minimumRating: 0, story: 'An old family firm making the same rod it made in 1974.' },
	marlow: { label: 'Marlow Tackle Co.', tier: 'club', minimumRating: 25, story: 'Honest mid-range. Most anglers own something of theirs.' },
	quarryman: { label: 'Quarryman', tier: 'club', minimumRating: 30, story: 'Tough, ugly, never straightens.' },
	fenwater: { label: 'Fenwater', tier: 'club', minimumRating: 35, story: 'A Fenland firm. Long rods and big spools for open water.' },
	halcyon: { label: 'Halcyon', tier: 'specialist', minimumRating: 50, story: 'Fine wire and thin strong line. Bought for the hooks.' },
	ironwood: { label: 'Ironwood', tier: 'specialist', minimumRating: 55, story: 'Big pit reels and 13 ft rods. Heavy and expensive.' },
	north_ridge: { label: 'North Ridge', tier: 'specialist', minimumRating: 60, story: 'Built for gravel pits in a gale. Hooks that hold, line that lasts.' },
	blackmere: { label: 'Blackmere', tier: 'custom', minimumRating: 75, story: 'Hand-built, two hundred a year, a waiting list.' },
	vellum_and_steel: { label: 'Vellum & Steel', tier: 'custom', minimumRating: 80, story: 'Chemically sharpened, absurd money, worth it.' },
	silvermere: { label: 'Silvermere', tier: 'custom', minimumRating: 85, story: 'The smoothest clutch ever machined. Reels by appointment.' }
};

export const BaitBrandCatalogue: Record<BaitBrandName, Brand & { appealFactor: number }> = {
	meadowmill: { label: 'Meadowmill Baits', tier: 'starter', minimumRating: 0, appealFactor: 0.9, story: 'Cheap and cheerful. The fish have seen it all before.' },
	redclay: { label: 'Redclay Baits', tier: 'club', minimumRating: 25, appealFactor: 1.0, story: 'A proper bait at a proper price.' },
	particle_works: { label: 'The Particle Works', tier: 'club', minimumRating: 25, appealFactor: 1.0, story: 'Hemp, maize and tigers, prepared right.' },
	nocturne: { label: 'Nocturne Baits', tier: 'specialist', minimumRating: 50, appealFactor: 1.12, story: 'Fishmeal and frozen. Rolled in small batches.' },
	stillwater_naturals: { label: 'Stillwater Naturals', tier: 'specialist', minimumRating: 55, appealFactor: 1.1, story: 'Worms, maggots and shrimp, alive this morning.' },
	saltmarsh: { label: 'Saltmarsh', tier: 'custom', minimumRating: 80, appealFactor: 1.2, story: 'The bait the big fish were caught on.' }
};

export function isTierAtOrBelow(tier: Tier, ceiling: Tier) {
	return TierRank[tier] <= TierRank[ceiling];
}

export function tierUnlockedBy(rating: number): Tier {
	return [...Tiers].reverse().find((tier) => rating >= TierMinimumRating[tier]) ?? 'starter';
}

export const TierMinimumRating: Record<Tier, number> = { starter: 0, club: 25, specialist: 50, custom: 75 };
