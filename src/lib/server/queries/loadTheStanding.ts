import type { AnglerStanding, VisitorsBest } from '$lib/contracts/HallOfFame';
import type { LeaderboardScope } from '$lib/contracts/Leaderboards';

type StandingRow = { rank: number; best_lb: number; anglers: number };
type VisitorsBestRow = { weight_lb: number; carp_id: string | null; lake_id: string; lake_name: string; angler_name: string; caught_at: string };

const NoStandingYet: AnglerStanding = { rank: 0, bestLb: 0, anglers: 0 };

export async function loadAnglerStanding(locals: App.Locals, scope: LeaderboardScope): Promise<AnglerStanding> {
	const { data } = await locals.supabase.rpc('angler_standing', { scope });
	const [row] = (data ?? []) as StandingRow[];
	if (!row) return NoStandingYet;
	return { rank: row.rank, bestLb: Number(row.best_lb), anglers: row.anglers };
}

export async function loadVisitorsBest(locals: App.Locals, scope: LeaderboardScope): Promise<VisitorsBest | null> {
	const { data } = await locals.supabase.rpc('visitors_best', { scope });
	const [row] = (data ?? []) as VisitorsBestRow[];
	if (!row) return null;
	return { weightLb: Number(row.weight_lb), carpId: row.carp_id, lakeId: row.lake_id, lakeName: row.lake_name, anglerName: row.angler_name, caughtAt: row.caught_at };
}
