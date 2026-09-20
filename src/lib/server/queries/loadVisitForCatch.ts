import type { Shoal } from '$lib/domain/stock/shoals';
import type { Carp, Lake } from '$lib/domain/types';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';

export interface VisitOnRecord {
	id: string;
	lake_id: string;
	visited_at: string;
	seed: number;
	tackle_losses: number;
}

export interface WaterOnRecord {
	lake: Lake;
	carp: Carp[];
	shoals: Shoal[];
}

export async function loadVisitOf(anglerId: string, visitId: string): Promise<VisitOnRecord | null> {
	const { data } = await trustedSupabase().from('lake_visits').select('id, lake_id, visited_at, seed, tackle_losses').eq('id', visitId).eq('angler_id', anglerId).maybeSingle();
	const visit = data as VisitOnRecord | null;
	if (!visit || visit.seed === null) return null;
	return { ...visit, seed: Number(visit.seed) };
}

export async function loadWaterOf(lakeId: string): Promise<WaterOnRecord | null> {
	const [{ data: lake }, { data: carp }, { data: shoals }] = await Promise.all([
		trustedSupabase().from('lakes').select('*').eq('id', lakeId).maybeSingle(),
		trustedSupabase().from('carp').select('*').eq('lake_id', lakeId),
		trustedSupabase().from('carp_shoals').select('*').eq('lake_id', lakeId)
	]);
	if (!lake) return null;
	return { lake: lake as Lake, carp: (carp ?? []) as Carp[], shoals: (shoals ?? []) as Shoal[] };
}

export async function hasCaughtDuringVisit(anglerId: string, visit: VisitOnRecord, carpId: string) {
	const { data: earlier } = await trustedSupabase()
		.from('catches')
		.select('id')
		.eq('angler_id', anglerId)
		.eq('lake_id', visit.lake_id)
		.eq('carp_id', carpId)
		.gte('caught_at', visit.visited_at)
		.limit(1);
	return (earlier ?? []).length > 0;
}
