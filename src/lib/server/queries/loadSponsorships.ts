import type { BrandName } from '$lib/domain/tackle/brands';
import type { BrandCredit, Sponsorship } from '$lib/domain/tackle/sponsorship';

type SponsorshipRow = { brand: BrandName; runs_until: string };
type CreditRow = { brand: BrandName; amount: number };

export async function loadSponsorships(locals: App.Locals, anglerId: string): Promise<Sponsorship[]> {
	const { data } = await locals.supabase.from('sponsorships').select('brand, runs_until').eq('profile_id', anglerId);
	return ((data ?? []) as SponsorshipRow[]).map((row) => ({ brand: row.brand, runsUntil: row.runs_until }));
}

export async function loadBrandCredits(locals: App.Locals, anglerId: string): Promise<BrandCredit[]> {
	const { data } = await locals.supabase.from('tackle_credits').select('brand, amount').eq('profile_id', anglerId);
	return ((data ?? []) as CreditRow[]).map((row) => ({ brand: row.brand, amount: Number(row.amount) }));
}
