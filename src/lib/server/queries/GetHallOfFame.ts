import type { HallOfFame, HallOfFameCatch, ProlificAngler, WaterOfLegend } from '$lib/contracts/HallOfFame';
import { WorldScope, type LeaderboardScope } from '$lib/contracts/Leaderboards';
import type { CarpMemorial } from '$lib/domain/memorialTypes';
import { requireUser } from '../gates/requireUser';
import { loadCarpNames } from './loadAnglerCatches';
import { loadStillSwimming } from './loadStillSwimming';

const BoardLength = 10;
const Descending = { ascending: false } as const;
const UnknownFish = 'A fish nobody named';

type BiggestRow = {
	id: string;
	carp_id: string | null;
	weight_lb: number;
	angler_id: string | null;
	angler_name: string;
	owner_name: string | null;
	caught_at: string;
	lake_id: string;
	lakes: { name: string; region: string };
};
type ProlificRow = { angler_id: string; angler_name: string; catches: number; heaviest_lb: number };
type WaterRow = { lake_id: string; lake_name: string; owner_name: string; heaviest_lb: number; catches: number };

export async function GetHallOfFame(locals: App.Locals, scope: LeaderboardScope): Promise<HallOfFame> {
	requireUser(locals);
	const [biggestEver, legends, mostFishLanded, watersOfLegend] = await Promise.all([
		loadBiggestEver(locals, scope),
		loadLegends(locals, scope),
		loadMostFishLanded(locals, scope),
		loadWatersOfLegend(locals, scope)
	]);
	return { scope, biggestEver, legends, mostFishLanded, watersOfLegend };
}

async function loadBiggestEver(locals: App.Locals, scope: LeaderboardScope): Promise<HallOfFameCatch[]> {
	const catches = locals.supabase.from('catches').select('id, carp_id, weight_lb, angler_id, angler_name, owner_name, caught_at, lake_id, lakes!catches_lake_id_fkey!inner(name, region)');
	const { data } = await withinScope(catches, 'lakes.region', scope).order('weight_lb', Descending).limit(BoardLength);
	const rows = (data ?? []) as unknown as BiggestRow[];
	const carpIds = rows.map((row) => row.carp_id);
	const [names, stillSwimming] = await Promise.all([loadCarpNames(locals, carpIds), loadStillSwimming(locals, carpIds)]);
	return rows.map((row) => ({
		catchId: row.id,
		carpId: row.carp_id,
		fishName: (row.carp_id && names[row.carp_id]) || UnknownFish,
		weightLb: Number(row.weight_lb),
		anglerId: row.angler_id,
		anglerName: row.angler_name,
		ownerName: row.owner_name,
		lakeId: row.lake_id,
		lakeName: row.lakes.name,
		caughtAt: row.caught_at,
		isStillSwimming: row.carp_id !== null && stillSwimming.has(row.carp_id)
	}));
}

async function loadLegends(locals: App.Locals, scope: LeaderboardScope): Promise<CarpMemorial[]> {
	const columns = scope === WorldScope ? '*' : '*, lakes!carp_memorial_lake_id_fkey!inner(region)';
	const remembered = locals.supabase.from('carp_memorial').select(columns);
	const { data } = await withinScope(remembered, 'lakes.region', scope).order('fame', Descending).order('weight_lb', Descending).limit(BoardLength);
	return ((data ?? []) as unknown as (CarpMemorial & { lakes?: unknown })[]).map(({ lakes: _lakes, ...fish }) => fish);
}

async function loadMostFishLanded(locals: App.Locals, scope: LeaderboardScope): Promise<ProlificAngler[]> {
	const { data } = await locals.supabase.rpc('most_fish_landed', { scope, top: BoardLength });
	return ((data ?? []) as ProlificRow[]).map((row) => ({ anglerId: row.angler_id, anglerName: row.angler_name, catches: Number(row.catches), heaviestLb: Number(row.heaviest_lb) }));
}

async function loadWatersOfLegend(locals: App.Locals, scope: LeaderboardScope): Promise<WaterOfLegend[]> {
	const { data } = await locals.supabase.rpc('waters_of_legend', { scope, top: BoardLength });
	return ((data ?? []) as WaterRow[]).map((row) => ({ lakeId: row.lake_id, lakeName: row.lake_name, ownerName: row.owner_name, heaviestLb: Number(row.heaviest_lb), catches: Number(row.catches) }));
}

function withinScope<Query extends { eq(column: string, value: string): Query }>(query: Query, regionColumn: string, scope: LeaderboardScope): Query {
	if (scope === WorldScope) return query;
	return query.eq(regionColumn, scope);
}
