import { WorldScope, type Leaderboards, type LeaderboardScope } from '$lib/contracts/Leaderboards';
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

const LeaderboardLength = 10;
const BestAnglerCandidateLimit = 200;
const Descending = { ascending: false } as const;

export async function GetLeaderboards(locals: App.Locals, scope: LeaderboardScope): Promise<Leaderboards> {
	requireUser(locals);
	const [biggestAlive, biggestEver, topReputation, bestAnglers] = await Promise.all([
		loadBiggestAlive(locals, scope),
		loadBiggestEver(locals, scope),
		loadTopReputation(locals, scope),
		loadBestAnglers(locals, scope)
	]);
	return { biggestAlive, biggestEver, topReputation, bestAnglers };
}

async function loadBiggestAlive(locals: App.Locals, scope: LeaderboardScope) {
	const catalogued = locals.supabase.from('carp').select('id, name, weight_lb, lake_id, lakes!carp_lake_id_fkey!inner(name, region)').eq('is_catalogued', true);
	const { data } = await withinScope(catalogued, 'lakes.region', scope).order('weight_lb', Descending).limit(LeaderboardLength);
	return rowsOf<BiggestAliveRow>(data).map(biggestAliveEntry);
}

async function loadBiggestEver(locals: App.Locals, scope: LeaderboardScope) {
	const catches = locals.supabase.from('catches').select('id, weight_lb, angler_name, caught_at, lakes!catches_lake_id_fkey!inner(name, region)');
	const { data } = await withinScope(catches, 'lakes.region', scope).order('weight_lb', Descending).limit(LeaderboardLength);
	return rowsOf<BiggestEverRow>(data).map(biggestEverEntry);
}

async function loadTopReputation(locals: App.Locals, scope: LeaderboardScope) {
	const openLakes = locals.supabase.from('lakes').select('id, name, reputation, profiles!lakes_owner_id_fkey(display_name)').eq('is_public', true).eq('is_setup_complete', true);
	const { data } = await withinScope(openLakes, 'region', scope).order('reputation', Descending).limit(LeaderboardLength);
	return rowsOf<TopReputationRow>(data).map(topReputationEntry);
}

async function loadBestAnglers(locals: App.Locals, scope: LeaderboardScope) {
	const owners = locals.supabase.from('profiles').select('id, display_name, line_selection, rig_selection, bait_selection, watercraft, lakes!lakes_owner_id_fkey!inner(region)');
	const { data } = await withinScope(owners, 'lakes.region', scope).order('watercraft', Descending).limit(BestAnglerCandidateLimit);
	const ranked = rowsOf<BestAnglerRow>(data).map(bestAnglerEntry).sort((first, second) => second.overallSkill - first.overallSkill);
	return ranked.slice(0, LeaderboardLength);
}

function withinScope<Query extends { eq(column: string, value: string): Query }>(query: Query, regionColumn: string, scope: LeaderboardScope): Query {
	if (scope === WorldScope) return query;
	return query.eq(regionColumn, scope);
}

function rowsOf<Row>(data: unknown): Row[] {
	return (data ?? []) as Row[];
}
