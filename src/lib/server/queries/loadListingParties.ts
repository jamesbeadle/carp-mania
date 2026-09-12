import type { ListingBid } from '$lib/contracts/ListingPage';
import type { Bid, Listing } from '$lib/domain/marketTypes';

const UnknownAngler = 'An angler';

type BidRow = Bid & { profiles: { display_name: string } | null };
type NamedProfile = { id: string; display_name: string };

export async function loadBidsOf(locals: App.Locals, listingId: string): Promise<ListingBid[]> {
	const { data: bids } = await locals.supabase.from('bids').select('*, profiles(display_name)').eq('listing_id', listingId).order('placed_at', { ascending: false });
	return ((bids ?? []) as BidRow[]).map(listingBidFrom);
}

export async function loadNextBidOf(locals: App.Locals, listingId: string): Promise<number> {
	const { data: nextBid } = await locals.supabase.rpc('next_bid_for', { listing: listingId });
	return Number(nextBid ?? 0);
}

export async function loadPartyNames(locals: App.Locals, listing: Pick<Listing, 'seller_id' | 'buyer_id'>) {
	const partyIds = [listing.seller_id, listing.buyer_id].filter((partyId): partyId is string => partyId !== null);
	const { data: profiles } = await locals.supabase.from('profiles').select('id, display_name').in('id', partyIds);
	const names = new Map(((profiles ?? []) as NamedProfile[]).map((profile) => [profile.id, profile.display_name]));
	return {
		sellerName: names.get(listing.seller_id) ?? UnknownAngler,
		buyerName: listing.buyer_id ? (names.get(listing.buyer_id) ?? UnknownAngler) : null
	};
}

export function isHoldingTheListing(bid: ListingBid) {
	return bid.status === 'leading' || bid.status === 'won';
}

function listingBidFrom(row: BidRow): ListingBid {
	return {
		id: row.id,
		amount: Number(row.amount),
		bidderId: row.bidder_id,
		bidderName: row.profiles?.display_name ?? UnknownAngler,
		status: row.status,
		placedAt: row.placed_at
	};
}
