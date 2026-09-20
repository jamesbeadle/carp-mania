import type { SupabaseClient } from '@supabase/supabase-js';
import type { BountyCard, BountyStatus } from '$lib/contracts/Bounties';
import { isBountyKind } from '$lib/domain/bounties/bountyKinds';
import { isDifficultyBand } from '$lib/domain/bounties/difficultyBand';
import type { PrizeKind } from '$lib/domain/bounties/prizeTackle';

type BountyRow = {
	id: string; lake_id: string; kind: string; band: string; swim_id: string | null; swim_name: string | null; target_carp_id: string | null;
	target_carp_name: string | null; target_weight_lb: number | null; sponsor_brand: string; posted_by: string | null; prize_kind: string; prize_money: number;
	prize_brand: string | null; opens_at: string; ends_at: string; status: string; winner_id: string | null; winner_name: string | null;
	lakes: { name: string } | null;
};

const Columns = '*, lakes (name)';
export const OpenBountiesShown = 12;

export async function GetBounties(supabase: SupabaseClient, limit = OpenBountiesShown): Promise<BountyCard[]> {
	const { data } = await supabase.from('bounties').select(Columns).eq('status', 'open').order('ends_at').limit(limit);
	return cardsFrom(data);
}

export async function loadBountiesOnTheWater(supabase: SupabaseClient, lakeId: string): Promise<BountyCard[]> {
	const { data } = await supabase.from('bounties').select(Columns).eq('lake_id', lakeId).order('opens_at', { ascending: false }).limit(OpenBountiesShown);
	return cardsFrom(data);
}

export async function loadBountyWonBy(supabase: SupabaseClient, catchId: string): Promise<BountyCard | null> {
	const { data } = await supabase.from('bounties').select(Columns).eq('winning_catch_id', catchId).limit(1);
	const [card] = cardsFrom(data);
	return card ?? null;
}

function cardsFrom(data: unknown): BountyCard[] {
	const rows = (data ?? []) as BountyRow[];
	return rows.flatMap((row) => (isBountyKind(row.kind) && isDifficultyBand(row.band) ? [cardFrom(row)] : []));
}

function cardFrom(row: BountyRow): BountyCard {
	const { id, band, sponsor_brand: sponsorBrand, winner_id: winnerId, winner_name: winnerName } = row;
	return {
		id, band: band as BountyCard['band'], sponsorBrand, winnerId, winnerName,
		lakeId: row.lake_id,
		lakeName: row.lakes?.name ?? 'a water',
		kind: row.kind as BountyCard['kind'],
		swimId: row.swim_id,
		swimName: row.swim_name,
		targetCarpId: row.target_carp_id,
		targetCarpName: row.target_carp_name,
		targetWeightLb: row.target_weight_lb === null ? null : Number(row.target_weight_lb),
		isOwnersOwn: row.posted_by !== null,
		prizeKind: row.prize_kind as PrizeKind,
		prizeMoney: Number(row.prize_money),
		prizeBrand: row.prize_brand,
		opensAt: row.opens_at,
		endsAt: row.ends_at,
		status: row.status as BountyStatus
	};
}
