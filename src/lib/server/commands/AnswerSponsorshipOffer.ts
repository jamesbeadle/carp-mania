import { fail } from '@sveltejs/kit';
import { BrandCatalogue } from '$lib/domain/tackle/brands';
import { formatMoney } from '$lib/format/money';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { loadOpenOffers } from '../queries/GetLakeSponsorship';

const OfferField = 'offerId';
const HttpStatus = { BadRequest: 400 } as const;

export async function AcceptSponsorshipOffer(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const offer = (await loadOpenOffers(locals, lake.id, new Date())).find((one) => one.id === String(formData.get(OfferField) ?? ''));
	if (!offer) return fail(HttpStatus.BadRequest, { message: 'That offer is no longer on the table' });
	const { error } = await locals.supabase.rpc('accept_lake_sponsorship', { offer: offer.id });
	if (error) return fail(HttpStatus.BadRequest, { message: error.message });
	return { message: `Signed with ${BrandCatalogue[offer.brand].label}: ${formatMoney(offer.amount)} in the bank and their name on the boards` };
}

export async function RejectSponsorshipOffer(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const offer = (await loadOpenOffers(locals, lake.id, new Date())).find((one) => one.id === String(formData.get(OfferField) ?? ''));
	if (!offer) return fail(HttpStatus.BadRequest, { message: 'That offer is no longer on the table' });
	const { error } = await locals.supabase.rpc('reject_lake_sponsorship', { offer: offer.id });
	if (error) return fail(HttpStatus.BadRequest, { message: error.message });
	return { message: `${BrandCatalogue[offer.brand].label} turned down — a better offer may come` };
}
