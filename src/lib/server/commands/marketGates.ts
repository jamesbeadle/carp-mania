import { fail } from '@sveltejs/kit';
import type { Listing } from '$lib/domain/marketTypes';
import type { Lake } from '$lib/domain/types';

export const ListingIdField = 'listingId';

export async function loadListingFromForm(locals: App.Locals, formData: FormData): Promise<Listing | null> {
	const listingId = String(formData.get(ListingIdField) ?? '');
	if (listingId === '') return null;
	const { data: listing } = await locals.supabase.from('listings').select('*').eq('id', listingId).maybeSingle();
	return listing as Listing | null;
}

export function noSuchListing() {
	return fail(400, { message: 'That listing does not exist' });
}

export async function lakeReadyToReceiveFish(locals: App.Locals, ownerId: string) {
	const { data: lake } = await locals.supabase.from('lakes').select('*').eq('owner_id', ownerId).maybeSingle();
	if (!lake) return refused('You need a water of your own to buy fish');
	const isPinned = lake.latitude !== null && lake.longitude !== null;
	if (!isPinned) return refused('Pin your water on the globe before you buy fish');
	return { value: lake as Lake, failure: null };
}

export async function transportCostTo(locals: App.Locals, listing: Listing, lake: Lake): Promise<number> {
	const { data: cost } = await locals.supabase.rpc('transport_cost_between', { from_lake: listing.lake_id, to_lake: lake.id });
	return Number(cost ?? 0);
}

export async function countBidsOn(locals: App.Locals, listingId: string): Promise<number> {
	const { count } = await locals.supabase.from('bids').select('id', { count: 'exact', head: true }).eq('listing_id', listingId);
	return count ?? 0;
}

function refused(message: string) {
	return { value: null, failure: fail(400, { message }) };
}
