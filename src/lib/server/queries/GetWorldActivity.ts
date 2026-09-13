import type { WorldActivity } from '$lib/contracts/WorldActivity';
import { AnglersDoings, AnglersGroup, kindsInGroup, type FeedGroup } from '$lib/domain/world/feedGroups';
import { activityFrom, type LakeIdentity } from '$lib/domain/world/worldActivity';
import type { WorldEvent } from '$lib/domain/worldTypes';
import { requireUser } from '../gates/requireUser';

export const WorldActivityLimit = { LiveFeed: 50, HomeHub: 5 } as const;

export interface FeedSlice {
	limit: number;
	before?: string | null;
	group?: FeedGroup | null;
}

const EventWithLakes = '*, lake:lakes!world_events_lake_id_fkey(name, region), other_lake:lakes!world_events_other_lake_id_fkey(name, region)';

type ActivityRow = WorldEvent & { lake: LakeIdentity | null; other_lake: LakeIdentity | null };

export async function GetWorldActivity(locals: App.Locals, slice: FeedSlice): Promise<WorldActivity[]> {
	requireUser(locals);
	let query = locals.supabase.from('world_events').select(EventWithLakes);
	if (slice.before) query = query.lt('created_at', slice.before);
	query = withinGroup(query, slice.group ?? null);
	const { data: rows } = await query.order('created_at', { ascending: false }).order('id').limit(slice.limit);
	return ((rows ?? []) as ActivityRow[]).map(activityFromRow);
}

function withinGroup<Query extends { in(column: string, values: string[]): Query; or(filters: string): Query }>(query: Query, group: FeedGroup | null): Query {
	if (group === AnglersGroup) return query.or(`payload->>anglerId.not.is.null,kind.in.(${AnglersDoings.join(',')})`);
	const kinds = kindsInGroup(group);
	return kinds ? query.in('kind', kinds) : query;
}

function activityFromRow(row: ActivityRow): WorldActivity {
	const { lake, other_lake, ...event } = row;
	const findLake = (lakeId: string) => (lakeId === event.lake_id ? lake : other_lake);
	return activityFrom(event, findLake);
}
