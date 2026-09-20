import type { SupabaseClient } from '@supabase/supabase-js';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import { Pressure, recentCapturesByFish } from '$lib/domain/water/pressure';

type Caught = { carp_id: string | null; caught_at: string };

export async function loadRecentCapturesBefore(client: SupabaseClient, lakeId: string, visitedAt: Date): Promise<Record<string, number>> {
	const since = new Date(visitedAt.getTime() - Pressure.RecentFisheryDays * FisheryClock.RealMillisecondsPerFisheryDay);
	const { data } = await client.from('catches').select('carp_id, caught_at').eq('lake_id', lakeId).gte('caught_at', since.toISOString()).lt('caught_at', visitedAt.toISOString());
	return Object.fromEntries(recentCapturesByFish((data ?? []) as Caught[], visitedAt));
}
