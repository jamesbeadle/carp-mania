import { fail } from '@sveltejs/kit';
import { whyListingCannotBeCancelled } from '$lib/domain/market/listingGates';
import { requireUser } from '../gates/requireUser';
import { countBidsOn, loadListingFromForm, noSuchListing } from './marketGates';

export async function CancelListing(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const listing = await loadListingFromForm(locals, formData);
	if (!listing) return noSuchListing();
	const refusal = whyListingCannotBeCancelled(listing, user.id, await countBidsOn(locals, listing.id));
	if (refusal) return fail(400, { message: refusal });

	const { error } = await locals.supabase.rpc('cancel_listing', { listing: listing.id });
	if (error) return fail(400, { message: error.message });
	return { message: 'The fish is off the market and stays in your water; the listing fee is spent' };
}
