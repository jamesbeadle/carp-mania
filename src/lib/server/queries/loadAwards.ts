import type { SupabaseClient } from '@supabase/supabase-js';
import type { AwardWon } from '$lib/contracts/Awards';
import { isAwardKey, NoTallies, type AwardTallies } from '$lib/domain/trophies/awards';

type TallyRow = {
	best_lb: number; fish_landed: number; regions_fished: number; home_grown_best_lb: number; light_rod_best_lb: number;
	records_set: number; record_waters: number; lifetime_lb: number; night_fish: number; morning_fish: number; ticket_kinds_fished: number;
	fish_sold: number;
};
type AwardRow = { award_key: string; won_at: string; catch_id: string | null };

export async function loadAwardTallies(supabase: SupabaseClient, anglerId: string): Promise<AwardTallies> {
	const { data } = await supabase.rpc('award_tallies_of', { angler: anglerId });
	const [row] = (data ?? []) as TallyRow[];
	if (!row) return NoTallies;
	const { fish_landed: fishLanded, regions_fished: regionsFished, records_set: recordsSet, record_waters: recordWaters } = row;
	const { night_fish: nightFish, morning_fish: morningFish, ticket_kinds_fished: ticketKindsFished, fish_sold: fishSold } = row;
	return {
		bestLb: Number(row.best_lb), fishLanded, regionsFished, homeGrownBestLb: Number(row.home_grown_best_lb),
		lightRodBestLb: Number(row.light_rod_best_lb), recordsSet, recordWaters,
		lifetimeLb: Number(row.lifetime_lb), nightFish, morningFish, ticketKindsFished, fishSold
	};
}

export async function loadAwardsHeld(supabase: SupabaseClient, anglerId: string): Promise<AwardWon[]> {
	const { data } = await supabase.from('awards').select('award_key, won_at, catch_id').eq('profile_id', anglerId).order('won_at', { ascending: false });
	const rows = (data ?? []) as AwardRow[];
	return rows.flatMap(awardFrom);
}

function awardFrom(row: AwardRow): AwardWon[] {
	const { award_key: key, won_at: wonAt, catch_id: catchId } = row;
	return isAwardKey(key) ? [{ key, wonAt, catchId }] : [];
}
