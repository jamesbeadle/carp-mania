import { fail, redirect } from '@sveltejs/kit';
import { listingFeeFor, whyCarpCannotBeListed } from '$lib/domain/market/listingRules';
import type { Carp } from '$lib/domain/types';
import { readListingTerms, type ListingOrder } from '../gates/readListingTerms';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const CarpIdField = 'carpId';

export async function ListCarpForSale(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const carp = await loadCarpInLake(locals, String(formData.get(CarpIdField) ?? ''), lake.id);
	if (!carp) return fail(400, { message: 'That fish is not in your water' });
	const refusal = whyCarpCannotBeListed(carp);
	if (refusal) return fail(400, { message: refusal });
	const terms = readListingTerms(formData);
	if (terms.failure) return terms.failure;
	const shortfall = moneyShortfall(await loadProfile(locals), listingFeeFor(terms.value.startingPrice));
	if (shortfall) return shortfall;

	const { data: listingId, error } = await locals.supabase.rpc('list_carp_for_sale', listingArguments(carp, terms.value));
	if (error) return fail(400, { message: error.message });
	redirect(303, `/market/${listingId}`);
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

async function loadCarpInLake(locals: App.Locals, carpId: string, lakeId: string): Promise<Carp | null> {
	if (carpId === '') return null;
	const { data: carp } = await locals.supabase.from('carp').select('*').eq('id', carpId).eq('lake_id', lakeId).maybeSingle();
	return carp as Carp | null;
}
