import type { SupabaseClient } from '@supabase/supabase-js';
import { seededRandom } from '$lib/domain/random';
import { offersOverDays, type NewOffer } from '$lib/domain/sponsorship/offerDraw';
import type { Lake } from '$lib/domain/types';
import { loadOpenOffers, loadRunningDeal, loadStandingOf } from '../queries/GetLakeSponsorship';

const OfferSalt = 7919;

export async function offerSponsorships(locals: App.Locals, trusted: SupabaseClient, lake: Lake, days: number, from: Date) {
	const [deal, offers, standing] = await Promise.all([loadRunningDeal(locals, lake.id, from), loadOpenOffers(locals, lake.id, from), loadStandingOf(trusted, lake, from)]);
	const random = seededRandom(new Date(lake.simulated_until).getTime() + OfferSalt);
	const drawn = offersOverDays(lake.id, standing, days, { deal, offers }, random, from);
	if (drawn.length === 0) return;
	await trusted.from('lake_sponsorship_offers').insert(drawn.map(rowOf));
	await trusted.rpc('refresh_lake_sponsor', { lake: lake.id });
}

function rowOf(offer: NewOffer) {
	return { lake_id: offer.lakeId, brand: offer.brand, term_months: offer.termMonths, amount: offer.amount, offered_at: offer.offeredAt, expires_at: offer.expiresAt };
}
