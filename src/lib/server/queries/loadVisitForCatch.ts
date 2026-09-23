import type { WaterAsFound } from '$lib/contracts/WaterAsFound';
import type { Skills } from '$lib/domain/anglerRating';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';

export interface VisitOnRecord {
	id: string;
	lake_id: string;
	visited_at: string;
	seed: number;
	tackle_losses: number;
	water_as_found: WaterAsFound;
	skills_at_start: Skills;
}

const VisitColumns = 'id, lake_id, visited_at, seed, tackle_losses, water_as_found, skills_at_start';

export async function loadVisitOf(anglerId: string, visitId: string): Promise<VisitOnRecord | null> {
	const { data } = await trustedSupabase().from('lake_visits').select(VisitColumns).eq('id', visitId).eq('angler_id', anglerId).maybeSingle();
	const visit = data as VisitOnRecord | null;
	if (!visit || visit.seed === null || visit.water_as_found === null) return null;
	return { ...visit, seed: Number(visit.seed) };
}

export async function countCarpIn(lakeId: string): Promise<number> {
	const { count } = await trustedSupabase().from('carp').select('id', { count: 'exact', head: true }).eq('lake_id', lakeId);
	return count ?? 0;
}
