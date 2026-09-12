import type { ReserveState } from '$lib/domain/market/reserveState';
import type { BidStatus, Listing } from '$lib/domain/marketTypes';
import type { CarpDossier } from './CarpDossier';

export interface ListingBid {
	id: string;
	amount: number;
	bidderId: string;
	bidderName: string;
	status: BidStatus;
	placedAt: string;
}

export interface LandedCostQuote {
	state: 'quoted';
	distanceKilometres: number;
	transportCost: number;
	transitDays: number;
	quarantineDays: number;
}

export type LandedCost = LandedCostQuote | { state: 'unavailable' | 'no_lake' | 'unpinned' };

export interface ListingPage {
	listing: Listing;
	dossier: CarpDossier;
	bids: ListingBid[];
	leadingBid: number | null;
	nextBid: number;
	reserve: ReserveState;
	landed: LandedCost;
	sellerName: string;
	buyerName: string | null;
	isSeller: boolean;
	isLeading: boolean;
}
