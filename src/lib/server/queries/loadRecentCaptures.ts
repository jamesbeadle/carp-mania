import type { SupabaseClient } from '@supabase/supabase-js';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import { Pressure, recentCapturesByFish } from '$lib/domain/water/pressure';

type Caught = { carp_id: string | null; caught_at: string };

export async function loadRecentCaptures(client: SupabaseClient, lakeId: string, now: Date): Promise<Map<string, number>> {
	const since = new Date(now.getTime() - Pressure.RecentFisheryDays * FisheryClock.RealMillisecondsPerFisheryDay);
	const { data } = await client.from('catches').select('carp_id, caught_at').eq('lake_id', lakeId).gte('caught_at', since.toISOString());
	return recentCapturesByFish((data ?? []) as Caught[], now);
}

export function recentCapturesAsRecord(captures: Map<string, number>): Record<string, number> {
	return Object.fromEntries(captures);
}
