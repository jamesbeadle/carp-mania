import type { SupabaseClient } from '@supabase/supabase-js';
import { Streak, streakDaysOf, streakIfFishedOn } from '$lib/domain/fishing/streak';

const MillisecondsPerDay = 24 * 60 * 60 * 1000;
const DaysToLookBack = Streak.MostDays + 1;

export async function loadStreakDays(client: SupabaseClient, anglerId: string, visitedAt: string): Promise<number> {
	return streakDaysOf(await loadDaysFished(client, anglerId, visitedAt), visitedAt);
}

export async function loadStreakIfFishedNow(client: SupabaseClient, anglerId: string, now: Date): Promise<number> {
	const today = now.toISOString();
	return streakIfFishedOn(await loadDaysFished(client, anglerId, today), today);
}

async function loadDaysFished(client: SupabaseClient, anglerId: string, until: string) {
	const since = new Date(new Date(until).getTime() - DaysToLookBack * MillisecondsPerDay);
	const { data } = await client.from('lake_visits').select('visited_at').eq('angler_id', anglerId).gte('visited_at', since.toISOString()).lte('visited_at', until);
	return ((data ?? []) as { visited_at: string }[]).map((visit) => visit.visited_at);
}
