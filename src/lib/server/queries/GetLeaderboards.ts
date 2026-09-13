import { WorldScope, type BoardLength, type Leaderboards, type LeaderboardScope } from '$lib/contracts/Leaderboards';
import { requireUser } from '../gates/requireUser';
import {
	bestAnglerEntry,
	biggestAliveEntry,
	biggestEverEntry,
	topReputationEntry,
	type BestAnglerRow,
	type BiggestAliveRow,
	type BiggestEverRow,
	type TopReputationRow
} from './leaderboardEntries';

const Descending = { ascending: false } as const;

export async function GetLeaderboards(locals: App.Locals, scope: LeaderboardScope, top: BoardLength): Promise<Leaderboards> {
	requireUser(locals);
	const [biggestAlive, biggestEver, topReputation, bestAnglers] = await Promise.all([
		loadBiggestAlive(locals, scope, top),
		loadBiggestEver(locals, scope, top),
		loadTopReputation(locals, scope, top),
		loadBestAnglers(locals, scope, top)
	]);
	return { biggestAlive, biggestEver, topReputation, bestAnglers };
}

async function loadBiggestAlive(locals: App.Locals, scope: LeaderboardScope, top: BoardLength) {
	const catalogued = locals.supabase.from('carp').select('id, name, weight_lb, lake_id, lakes!carp_lake_id_fkey!inner(name, region)').eq('is_catalogued', true);
	const { data } = await withinScope(catalogued, 'lakes.region', scope).order('weight_lb', Descending).limit(top);
	return rowsOf<BiggestAliveRow>(data).map(biggestAliveEntry);
}

async function loadBiggestEver(locals: App.Locals, scope: LeaderboardScope, top: BoardLength) {
	let catches = locals.supabase.from('catches').select('id, weight_lb, angler_id, angler_name, caught_at, lakes!catches_lake_id_fkey!inner(name, region)').not('angler_id', 'is', null);
	if (scope !== WorldScope) catches = catches.eq('lakes.region', scope);
	const { data } = await catches.order('weight_lb', Descending).order('caught_at').limit(top);
	return rowsOf<BiggestEverRow>(data).map(biggestEverEntry);
}

async function loadTopReputation(locals: App.Locals, scope: LeaderboardScope, top: BoardLength) {
	const openLakes = locals.supabase.from('lakes').select('id, name, reputation, profiles!lakes_owner_id_fkey(display_name)').eq('is_public', true).eq('is_setup_complete', true);
	const { data } = await withinScope(openLakes, 'region', scope).order('reputation', Descending).limit(top);
	return rowsOf<TopReputationRow>(data).map(topReputationEntry);
}

async function loadBestAnglers(locals: App.Locals, scope: LeaderboardScope, top: BoardLength) {
	const anglers = locals.supabase.from('angler_summaries').select('id, display_name, overall_skill');
	const { data } = await withinScope(anglers, 'home_region', scope).order('overall_skill', Descending).order('display_name').limit(top);
	return rowsOf<BestAnglerRow>(data).map(bestAnglerEntry);
}

function withinScope<Query extends { eq(column: string, value: string): Query }>(query: Query, regionColumn: string, scope: LeaderboardScope): Query {
	if (scope === WorldScope) return query;
	return query.eq(regionColumn, scope);
}

function rowsOf<Row>(data: unknown): Row[] {
	return (data ?? []) as Row[];
}
