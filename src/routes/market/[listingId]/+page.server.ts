import type { Actions, PageServerLoad } from './$types';
import { BuyListedCarpNow } from '$lib/server/commands/BuyListedCarpNow';
import { CancelListing } from '$lib/server/commands/CancelListing';
import { PlaceBid } from '$lib/server/commands/PlaceBid';
import { GetListing } from '$lib/server/queries/GetListing';
import { ListingRefresh } from './listingRefresh';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	depends(ListingRefresh.Dependency);
	return { listingPage: await GetListing(locals, params.listingId), loadedAt: new Date().toISOString() };
};

export const actions: Actions = {
	bid: ({ locals, request }) => request.formData().then((formData) => PlaceBid(locals, formData)),
	buyNow: ({ locals, request }) => request.formData().then((formData) => BuyListedCarpNow(locals, formData)),
	cancel: ({ locals, request }) => request.formData().then((formData) => CancelListing(locals, formData))
};
