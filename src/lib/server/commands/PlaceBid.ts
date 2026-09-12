import { fail } from '@sveltejs/kit';
import { landedCost } from '$lib/domain/market/bidRules';
import { whyListingRefusesBid } from '$lib/domain/market/listingGates';
import { formatMoney } from '$lib/format/money';
import { readFormNumber } from '../gates/readFormNumber';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { loadNextBidOf } from '../queries/loadListingParties';
import { lakeReadyToReceiveFish, loadListingFromForm, noSuchListing, transportCostTo } from './marketGates';

const BidAmount = { Field: 'amount', Lowest: 0, Highest: 10_000_000 } as const;

export async function PlaceBid(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const listing = await loadListingFromForm(locals, formData);
	if (!listing) return noSuchListing();
	const refusal = whyListingRefusesBid(listing, user.id, new Date());
	if (refusal) return fail(400, { message: refusal });
	const amount = readFormNumber(formData, BidAmount.Field, BidAmount.Lowest, BidAmount.Highest);
	if (amount.failure) return amount.failure;
	const myLake = await lakeReadyToReceiveFish(locals, user.id);
	if (myLake.failure) return myLake.failure;

	const nextBid = await loadNextBidOf(locals, listing.id);
	if (amount.value < nextBid) return fail(400, { message: `The next bid is at least ${formatMoney(nextBid)}` });
	const transport = await transportCostTo(locals, listing, myLake.value);
	const held = landedCost(amount.value, transport);
	const shortfall = moneyShortfall(await loadProfile(locals), held);
	if (shortfall) return shortfall;

	const { error } = await locals.supabase.rpc('place_bid', { listing: listing.id, amount: amount.value });
	if (error) return fail(400, { message: error.message });
	return { message: `You're leading at ${formatMoney(amount.value)} — ${formatMoney(held)} with transport is held until you're outbid` };
}
