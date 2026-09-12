import type { ListingKind } from '$lib/domain/market/listingRules';
import type { MarketFilters } from '$lib/domain/market/marketFilters';
import type { CarpStrain } from '$lib/domain/types';
import type { RegionCode } from '$lib/domain/world/regionCodes';

export interface CardCarp {
	id: string;
	name: string;
	strain: CarpStrain;
	weightLb: number;
	condition: number;
	fame: number;
	isCatalogued: boolean;
}

export interface CardLake {
	id: string;
	name: string;
	region: RegionCode;
}

export interface MarketListingCard {
	id: string;
	kind: ListingKind;
	startingPrice: number;
	buyNowPrice: number | null;
	endsAt: string;
	carp: CardCarp;
	lake: CardLake | null;
	leadingBid: number | null;
	bidCount: number;
}

export interface MarketListingsPage {
	cards: MarketListingCard[];
	filters: MarketFilters;
	total: number;
	pageCount: number;
}
