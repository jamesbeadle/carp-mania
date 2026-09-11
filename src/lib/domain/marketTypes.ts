import type { ListingKind } from './market/listingRules';

export type ListingStatus = 'open' | 'sold' | 'unsold' | 'cancelled';
export type BidStatus = 'leading' | 'outbid' | 'won' | 'refunded';
export type TransferKind = 'sale' | 'dealer_purchase' | 'farm_delivery' | 'dealer_sale';

export interface Listing {
	id: string;
	carp_id: string;
	lake_id: string;
	seller_id: string;
	kind: ListingKind;
	starting_price: number;
	reserve_price: number | null;
	buy_now_price: number | null;
	listing_fee: number;
	ends_at: string;
	latest_ends_at: string;
	status: ListingStatus;
	sold_price: number | null;
	buyer_id: string | null;
	settled_at: string | null;
	created_at: string;
}

export interface Bid {
	id: string;
	listing_id: string;
	bidder_id: string;
	amount: number;
	transport_cost: number;
	status: BidStatus;
	placed_at: string;
}

export interface CarpTransfer {
	id: string;
	carp_id: string | null;
	carp_name: string;
	kind: TransferKind;
	listing_id: string | null;
	from_lake_id: string | null;
	to_lake_id: string | null;
	price: number;
	commission: number;
	transport_cost: number;
	distance_km: number;
	farm_band: string | null;
	departed_at: string;
	arrives_at: string;
	quarantine_until: string | null;
}
