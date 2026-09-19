import type { Shoal } from '$lib/domain/stock/shoals';
import type { LakeSpecies } from '$lib/domain/water/species';
import type { Carp, Lake } from '$lib/domain/types';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadRecentCaptures, recentCapturesAsRecord } from './loadRecentCaptures';

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
	recentCaptures: Record<string, number>;
	species: LakeSpecies[];
}

export async function loadVisitOf(anglerId: string, visitId: string): Promise<VisitOnRecord | null> {
	const { data } = await trustedSupabase().from('lake_visits').select('id, lake_id, visited_at, seed, tackle_losses').eq('id', visitId).eq('angler_id', anglerId).maybeSingle();
	const visit = data as VisitOnRecord | null;
	if (!visit || visit.seed === null) return null;
	return { ...visit, seed: Number(visit.seed) };
}

export async function loadWaterOf(lakeId: string): Promise<WaterOnRecord | null> {
	const trusted = trustedSupabase();
	const [{ data: lake }, { data: carp }, { data: shoals }, captures, { data: species }] = await Promise.all([
		trusted.from('lakes').select('*').eq('id', lakeId).maybeSingle(),
		trusted.from('carp').select('*').eq('lake_id', lakeId),
		trusted.from('carp_shoals').select('*').eq('lake_id', lakeId),
		loadRecentCaptures(trusted, lakeId, new Date()),
		trusted.from('lake_species').select('*').eq('lake_id', lakeId)
	]);
	if (!lake) return null;
	return { lake: lake as Lake, carp: (carp ?? []) as Carp[], shoals: (shoals ?? []) as Shoal[], recentCaptures: recentCapturesAsRecord(captures), species: (species ?? []) as LakeSpecies[] };
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
