import { fail, redirect } from '@sveltejs/kit';
import { listingFeeFor, whyCarpCannotBeListed } from '$lib/domain/market/listingRules';
import type { Carp } from '$lib/domain/types';
import { isPricedAtGuide, orderAtGuideFor, readAtGuideTerms } from '../gates/readAtGuideTerms';
import { loadChosenFishInLake, readChosenFishIds, whyChosenFishAreMissing } from '../gates/readChosenFish';
import { readListingTerms, type ListingOrder } from '../gates/readListingTerms';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const MarketTab = '/lake#market';

export async function ListFishForSale(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const chosen = readChosenFishIds(formData);
	if (chosen.failure) return chosen.failure;
	const fish = await loadChosenFishInLake(locals, chosen.value, lake.id);
	const missing = whyChosenFishAreMissing(chosen.value, fish);
	if (missing) return fail(400, { message: missing });
	const refusal = fish.map(whyCarpCannotBeListed).find((reason) => reason !== null);
	if (refusal) return fail(400, { message: refusal });
	const orders = readOrders(formData, fish);
	if (orders.failure) return orders.failure;
	const fees = orders.value.reduce((total, order) => total + listingFeeFor(order.startingPrice), 0);
	const shortfall = moneyShortfall(await loadProfile(locals), fees);
	if (shortfall) return shortfall;

	const listingIds = await openListings(locals, fish, orders.value);
	if (typeof listingIds === 'string') return fail(400, { message: listingIds });
	if (listingIds.length === 1) redirect(303, `/market/${listingIds[0]}`);
	redirect(303, MarketTab);
}

function readOrders(formData: FormData, fish: Carp[]) {
	if (isPricedAtGuide(formData)) {
		const terms = readAtGuideTerms(formData);
		if (terms.failure) return terms;
		return { value: fish.map((one) => orderAtGuideFor(one, terms.value)), failure: null };
	}
	const terms = readListingTerms(formData);
	if (terms.failure) return terms;
	return { value: fish.map(() => terms.value), failure: null };
}

async function openListings(locals: App.Locals, fish: Carp[], orders: ListingOrder[]) {
	const listingIds: string[] = [];
	for (const [index, one] of fish.entries()) {
		const { data: listingId, error } = await locals.supabase.rpc('list_carp_for_sale', listingArguments(one, orders[index]));
		if (error) return error.message;
		listingIds.push(String(listingId));
	}
	return listingIds;
}

function listingArguments(carp: Carp, terms: ListingOrder) {
	return {
		fish: carp.id,
		kind: terms.kind,
		starting_price: terms.startingPrice,
		reserve_price: terms.reservePrice,
		buy_now_price: terms.buyNowPrice,
		duration_hours: terms.durationHours
	};
}
