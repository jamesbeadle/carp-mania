import { error } from '@sveltejs/kit';
import type { ListingPage } from '$lib/contracts/ListingPage';
import { reserveState } from '$lib/domain/market/reserveState';
import type { Listing } from '$lib/domain/marketTypes';
import { requireUser } from '../gates/requireUser';
import { GetCarpDossier } from './GetCarpDossier';
import { landedCostFor } from './landedCostFor';
import { isHoldingTheListing, loadBidsOf, loadNextBidOf, loadPartyNames } from './loadListingParties';

const NoSuchListing = 'That listing does not exist';

export async function GetListing(locals: App.Locals, listingId: string): Promise<ListingPage> {
	const user = requireUser(locals);
	const listing = await loadListing(locals, listingId);
	const [dossier, bids, nextBid, parties, landed] = await Promise.all([
		GetCarpDossier(locals, listing.carp_id),
		loadBidsOf(locals, listing.id),
		loadNextBidOf(locals, listing.id),
		loadPartyNames(locals, listing),
		landedCostFor(locals, listing, user.id)
	]);
	const holder = bids.find(isHoldingTheListing) ?? null;
	const leadingBid = holder ? holder.amount : null;
	return {
		listing,
		dossier,
		bids,
		leadingBid,
		nextBid,
		reserve: reserveState(listing.reserve_price === null ? null : Number(listing.reserve_price), leadingBid),
		landed,
		...parties,
		isSeller: listing.seller_id === user.id,
		isLeading: holder?.bidderId === user.id
	};
}

async function loadListing(locals: App.Locals, listingId: string): Promise<Listing> {
	const { data: listing } = await locals.supabase.from('listings').select('*').eq('id', listingId).maybeSingle();
	if (!listing) error(404, NoSuchListing);
	return listing as Listing;
}
