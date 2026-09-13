import type { SupabaseClient } from '@supabase/supabase-js';
import type { StandingRecords } from '$lib/domain/market/records';
import type { Lake } from '$lib/domain/types';

const HeaviestFirst = { ascending: false } as const;

type WeightRow = { weight_lb: number } | null;

export async function GetStandingRecords(supabase: SupabaseClient, lake: Pick<Lake, 'id' | 'region'>): Promise<StandingRecords> {
	const [lakeRecordLb, regionRecordLb, worldRecordLb] = await Promise.all([heaviestOnTheLake(supabase, lake.id), heaviestInTheRegion(supabase, lake.region), heaviestInTheWorld(supabase)]);
	return { lakeRecordLb, regionRecordLb, worldRecordLb };
}

async function heaviestOnTheLake(supabase: SupabaseClient, lakeId: string) {
	const { data } = await anglersCatches(supabase, 'weight_lb').eq('lake_id', lakeId).order('weight_lb', HeaviestFirst).limit(1).maybeSingle();
	return poundsOf(data as WeightRow);
}

async function heaviestInTheRegion(supabase: SupabaseClient, region: string) {
	const { data } = await anglersCatches(supabase, 'weight_lb, lakes!inner(region)').eq('lakes.region', region).order('weight_lb', HeaviestFirst).limit(1).maybeSingle();
	return poundsOf(data as unknown as WeightRow);
}

async function heaviestInTheWorld(supabase: SupabaseClient) {
	const { data } = await anglersCatches(supabase, 'weight_lb').order('weight_lb', HeaviestFirst).limit(1).maybeSingle();
	return poundsOf(data as WeightRow);
}

function anglersCatches(supabase: SupabaseClient, columns: string) {
	return supabase.from('catches').select(columns).not('angler_id', 'is', null);
}

function poundsOf(row: WeightRow) {
	return row ? Number(row.weight_lb) : 0;
}
