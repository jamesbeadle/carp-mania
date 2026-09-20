import type { AnglerRanks, CatchCard, RecordHeld, TrophyRoom } from '$lib/contracts/TrophyRoom';
import { TrophyRoomCards } from '$lib/contracts/TrophyRoom';
import type { HonourKind } from '$lib/domain/fishing/honours';
import { isRecordScope, recordScopeNameFor } from '$lib/domain/trophies/recordScopes';
import { loadCarpNames } from './loadAnglerCatches';
import { loadAwardsHeld } from './loadAwards';
import { loadStillSwimming } from './loadStillSwimming';

type CardRow = {
	catch_id: string; carp_id: string | null; weight_lb: number; caught_at: string; lake_id: string; lake_name: string; swim_name: string;
	was_personal_best: boolean; was_lake_record: boolean; was_region_record: boolean; was_world_record: boolean;
	holds_lake_record: boolean; holds_region_record: boolean; holds_world_record: boolean;
};
type RecordRow = { scope: string; scope_id: string; scope_name: string; catch_id: string; carp_id: string | null; weight_lb: number; caught_at: string };
type RanksRow = { best_rank: number; best_lb: number; skill_rank: number; anglers: number };

const UnnamedFish = 'A fish nobody named';
const NoRanksYet: AnglerRanks = { bestRank: 0, bestLb: 0, skillRank: 0, anglers: 0 };

export async function loadTrophyRoom(locals: App.Locals, anglerId: string): Promise<TrophyRoom> {
	const [cardRows, recordRows, awards, ranks] = await Promise.all([loadCards(locals, anglerId), loadRecords(locals, anglerId), loadAwardsHeld(locals.supabase, anglerId), loadRanks(locals, anglerId)]);
	const carpIds = [...cardRows, ...recordRows].map((row) => row.carp_id);
	const [names, stillSwimming] = await Promise.all([loadCarpNames(locals, carpIds), loadStillSwimming(locals, carpIds)]);
	const nameOf = (carpId: string | null) => (carpId && names[carpId]) || UnnamedFish;
	return {
		cards: cardRows.map((row) => cardFrom(row, nameOf(row.carp_id), stillSwimming)),
		recordsHeld: recordRows.filter((row) => isRecordScope(row.scope)).map((row) => recordFrom(row, nameOf(row.carp_id))),
		awards,
		ranks
	};
}

async function loadCards(locals: App.Locals, anglerId: string): Promise<CardRow[]> {
	const { data } = await locals.supabase.rpc('catch_cards', { angler: anglerId, top: TrophyRoomCards });
	return (data ?? []) as CardRow[];
}

async function loadRecords(locals: App.Locals, anglerId: string): Promise<RecordRow[]> {
	const { data } = await locals.supabase.rpc('records_held_by', { angler: anglerId });
	return (data ?? []) as RecordRow[];
}

export async function loadRanks(locals: App.Locals, anglerId: string): Promise<AnglerRanks> {
	const { data } = await locals.supabase.rpc('angler_ranks', { angler: anglerId });
	const [row] = (data ?? []) as RanksRow[];
	if (!row) return NoRanksYet;
	return { bestRank: row.best_rank, bestLb: Number(row.best_lb), skillRank: row.skill_rank, anglers: row.anglers };
}

function cardFrom(row: CardRow, fishName: string, stillSwimming: Set<string>): CatchCard {
	const honours: [HonourKind, boolean][] = [['world_record', row.was_world_record], ['region_record', row.was_region_record], ['lake_record', row.was_lake_record], ['personal_best', row.was_personal_best]];
	const holds: ['world' | 'region' | 'lake', boolean][] = [['world', row.holds_world_record], ['region', row.holds_region_record], ['lake', row.holds_lake_record]];
	return {
		catchId: row.catch_id,
		carpId: row.carp_id,
		fishName,
		weightLb: Number(row.weight_lb),
		caughtAt: row.caught_at,
		lakeId: row.lake_id,
		lakeName: row.lake_name,
		swimName: row.swim_name,
		honoursOnTheDay: honours.filter(([, isHeld]) => isHeld).map(([kind]) => kind),
		stillHolds: holds.filter(([, isHeld]) => isHeld).map(([scope]) => scope),
		isStillSwimming: row.carp_id !== null && stillSwimming.has(row.carp_id)
	};
}

function recordFrom(row: RecordRow, fishName: string): RecordHeld {
	const scope = row.scope as RecordHeld['scope'];
	return { scope, scopeId: row.scope_id, scopeName: recordScopeNameFor(scope, row.scope_name), catchId: row.catch_id, carpId: row.carp_id, fishName, weightLb: Number(row.weight_lb), caughtAt: row.caught_at };
}
