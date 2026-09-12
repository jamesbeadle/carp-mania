import type { WorldActivity } from '$lib/contracts/WorldActivity';
import { kindsInGroup, type FeedGroup } from '$lib/domain/world/feedGroups';
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
	const kinds = kindsInGroup(slice.group ?? null);
	let query = locals.supabase.from('world_events').select(EventWithLakes);
	if (slice.before) query = query.lt('created_at', slice.before);
	if (kinds) query = query.in('kind', kinds);
	const { data: rows } = await query.order('created_at', { ascending: false }).order('id').limit(slice.limit);
	return ((rows ?? []) as ActivityRow[]).map(activityFromRow);
}

function activityFromRow(row: ActivityRow): WorldActivity {
	const { lake, other_lake, ...event } = row;
	const findLake = (lakeId: string) => (lakeId === event.lake_id ? lake : other_lake);
	return activityFrom(event, findLake);
}
