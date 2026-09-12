import type { MatchCard } from '$lib/contracts/MatchCard';
import { matchPhaseOf, potOf } from '$lib/domain/matches/matchRules';
import type { Match } from '$lib/domain/matches/matchTypes';

export const MatchWithParties = '*, lake:lakes!matches_lake_id_fkey(name, owner:profiles!lakes_owner_id_fkey(display_name)), host:profiles!matches_host_id_fkey(display_name), entries:match_entries(count)';

const WaterSinceClosed = 'A water since closed';
const UnknownOwner = 'Unknown owner';
const UnknownHost = 'Unknown host';

export type MatchRow = Match & {
	lake: { name: string; owner: { display_name: string } | null } | null;
	host: { display_name: string } | null;
	entries: { count: number }[];
};

export function matchCardFrom(row: MatchRow, viewerId: string, enteredMatchIds: Set<string>, now: Date): MatchCard {
	const { lake, host, entries, ...match } = row;
	const entryCount = entries[0]?.count ?? 0;
	return {
		match: match as Match,
		lakeName: lake?.name ?? WaterSinceClosed,
		ownerName: lake?.owner?.display_name ?? UnknownOwner,
		hostName: host?.display_name ?? UnknownHost,
		entryCount,
		pot: potOf(match, entryCount),
		phase: matchPhaseOf(match, now),
		isEntered: enteredMatchIds.has(match.id),
		isHost: match.host_id === viewerId
	};
}

export async function loadEnteredMatchIds(locals: App.Locals, anglerId: string): Promise<Set<string>> {
	const { data } = await locals.supabase.from('match_entries').select('match_id').eq('angler_id', anglerId);
	return new Set(((data ?? []) as { match_id: string }[]).map((entry) => entry.match_id));
}

export async function loadOpenMatchesAt(locals: App.Locals, lakeId: string): Promise<MatchRow[]> {
	const { data } = await locals.supabase.from('matches').select(MatchWithParties).eq('lake_id', lakeId).eq('status', 'open').order('starts_at');
	return (data ?? []) as unknown as MatchRow[];
}
