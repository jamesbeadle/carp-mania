import type { LakeSponsorshipPanel } from '$lib/contracts/LakeSponsorshipPanel';
import { isOfferOpen, isSponsorshipRunning, type LakeSponsorship, type SponsorshipOffer } from '$lib/domain/sponsorship/lakeSponsorship';
import type { BrandName } from '$lib/domain/tackle/brands';
import { waterRatingOfLake } from '$lib/domain/water/waterRating';
import { requireOwnedLake } from '../gates/requireOwnedLake';

type OfferRow = { id: string; lake_id: string; brand: BrandName; term_months: number; amount: number; offered_at: string; expires_at: string; status: SponsorshipOffer['status'] };
type DealRow = { id: string; lake_id: string; brand: BrandName; term_months: number; amount: number; signed_at: string; runs_until: string };

export async function GetLakeSponsorship(locals: App.Locals, now = new Date()): Promise<LakeSponsorshipPanel> {
	const lake = await requireOwnedLake(locals);
	const [deal, offers] = await Promise.all([loadRunningDeal(locals, lake.id, now), loadOpenOffers(locals, lake.id, now)]);
	return { deal, offers, waterRating: waterRatingOfLake(lake), loadedAt: now.toISOString() };
}

export async function loadRunningDeal(locals: App.Locals, lakeId: string, now: Date): Promise<LakeSponsorship | null> {
	const { data } = await locals.supabase.from('lake_sponsorships').select('*').eq('lake_id', lakeId).gt('runs_until', now.toISOString()).order('runs_until', { ascending: false }).limit(1);
	const [row] = (data ?? []) as DealRow[];
	if (!row) return null;
	const deal = { id: row.id, lakeId: row.lake_id, brand: row.brand, termMonths: row.term_months, amount: Number(row.amount), signedAt: row.signed_at, runsUntil: row.runs_until };
	return isSponsorshipRunning(deal, now) ? deal : null;
}

export async function loadOpenOffers(locals: App.Locals, lakeId: string, now: Date): Promise<SponsorshipOffer[]> {
	const { data } = await locals.supabase.from('lake_sponsorship_offers').select('*').eq('lake_id', lakeId).eq('status', 'open').order('offered_at', { ascending: false });
	const offers = ((data ?? []) as OfferRow[]).map(offerFrom);
	return offers.filter((offer) => isOfferOpen(offer, now));
}

function offerFrom(row: OfferRow): SponsorshipOffer {
	return { id: row.id, lakeId: row.lake_id, brand: row.brand, termMonths: row.term_months, amount: Number(row.amount), offeredAt: row.offered_at, expiresAt: row.expires_at, status: row.status };
}
