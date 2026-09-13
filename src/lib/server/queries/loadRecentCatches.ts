import type { RecentCatches } from '$lib/contracts/RecentCatches';
import { fisheryWeekStart } from '$lib/domain/market/fishFarm';
import type { Catch } from '$lib/domain/types';

const RecentLimit = 15;
const LatestFirst = { ascending: false } as const;

export async function loadRecentCatches(locals: App.Locals, lakeId: string, now: Date): Promise<RecentCatches> {
	const recent = () => locals.supabase.from('catches').select('*').eq('lake_id', lakeId).order('caught_at', LatestFirst).limit(RecentLimit);
	const thisWeek = locals.supabase.from('catches').select('weight_lb').eq('lake_id', lakeId).is('angler_id', null).gte('caught_at', fisheryWeekStart(now).toISOString());
	const [byAnglers, byVisitors, visitorsThisWeek] = await Promise.all([recent().not('angler_id', 'is', null), recent().is('angler_id', null), thisWeek]);
	const weights = ((visitorsThisWeek.data ?? []) as { weight_lb: number }[]).map((row) => Number(row.weight_lb));
	return {
		byAnglers: (byAnglers.data ?? []) as Catch[],
		byVisitors: (byVisitors.data ?? []) as Catch[],
		visitorsThisWeek: { count: weights.length, bestLb: weights.length > 0 ? Math.max(...weights) : 0 }
	};
}
