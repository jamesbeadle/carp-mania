import { fail } from '@sveltejs/kit';
import { landedCost } from '$lib/domain/market/bidRules';
import { whyListingRefusesBuyNow } from '$lib/domain/market/listingGates';
import { formatMoney } from '$lib/format/money';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { lakeReadyToReceiveFish, loadListingFromForm, noSuchListing, transportCostTo } from './marketGates';

export async function BuyListedCarpNow(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const listing = await loadListingFromForm(locals, formData);
	if (!listing) return noSuchListing();
	const refusal = whyListingRefusesBuyNow(listing, user.id, new Date());
	if (refusal) return fail(400, { message: refusal });
	const myLake = await lakeReadyToReceiveFish(locals, user.id);
	if (myLake.failure) return myLake.failure;

	const price = Number(listing.buy_now_price);
	const transport = await transportCostTo(locals, listing, myLake.value);
	const shortfall = moneyShortfall(await loadProfile(locals), landedCost(price, transport));
	if (shortfall) return shortfall;

	const { error } = await locals.supabase.rpc('buy_now', { listing: listing.id });
	if (error) return fail(400, { message: error.message });
	return { message: `Yours for ${formatMoney(price)} plus ${formatMoney(transport)} transport — the fish is on its way to your water` };
}
