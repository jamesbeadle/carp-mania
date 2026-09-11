import type { Bid, CarpTransfer, Listing } from '$lib/domain/marketTypes';
import type { CarpStrain } from '$lib/domain/types';

export interface ListedFish {
	id: string;
	name: string;
	strain: CarpStrain;
	weightLb: number;
}

export interface MyListing {
	listing: Listing;
	fish: ListedFish;
	leadingBid: number | null;
	bidCount: number;
}

export interface MyBid {
	bid: Bid;
	listing: Listing;
	fish: ListedFish;
	lakeName: string;
	leadingBid: number | null;
}

export interface MyMarketActivity {
	openListings: MyListing[];
	closedListings: MyListing[];
	leadingBids: MyBid[];
	outbidBids: MyBid[];
	sales: CarpTransfer[];
	purchases: CarpTransfer[];
	lakeNames: Record<string, string>;
}
