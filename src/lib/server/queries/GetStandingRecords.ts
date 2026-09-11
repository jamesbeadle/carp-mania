import type { SupabaseClient } from '@supabase/supabase-js';
import type { StandingRecords } from '$lib/domain/market/records';
import type { Lake } from '$lib/domain/types';

export async function GetStandingRecords(supabase: SupabaseClient, lake: Pick<Lake, 'id' | 'region'>): Promise<StandingRecords> {
	const [lakeRecordLb, regionRecordLb, worldRecordLb] = await Promise.all([
		heaviestCatch(supabase, (query) => query.eq('lake_id', lake.id)),
		heaviestCatch(supabase, (query) => query.eq('lakes.region', lake.region), 'weight_lb, lakes!inner(region)'),
		heaviestCatch(supabase, (query) => query)
	]);
	return { lakeRecordLb, regionRecordLb, worldRecordLb };
}

type Narrow = (query: ReturnType<ReturnType<SupabaseClient['from']>['select']>) => ReturnType<ReturnType<SupabaseClient['from']>['select']>;

async function heaviestCatch(supabase: SupabaseClient, narrow: Narrow, columns = 'weight_lb') {
	const { data } = await narrow(supabase.from('catches').select(columns)).order('weight_lb', { ascending: false }).limit(1).maybeSingle();
	const row = data as { weight_lb: number } | null;
	return row ? Number(row.weight_lb) : 0;
}
