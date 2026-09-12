import { currentWaterOf } from '$lib/domain/estate/estateRules';
import type { Lake } from '$lib/domain/types';

export async function loadMyWaters(locals: App.Locals, ownerId: string): Promise<Lake[]> {
	const { data } = await locals.supabase.from('lakes').select('*').eq('owner_id', ownerId).order('created_at');
	return (data ?? []) as Lake[];
}

export async function loadCurrentWater(locals: App.Locals, ownerId: string): Promise<Lake | null> {
	const [waters, currentLakeId] = await Promise.all([loadMyWaters(locals, ownerId), loadCurrentLakeId(locals, ownerId)]);
	return currentWaterOf(waters, currentLakeId);
}

export async function loadCurrentLakeId(locals: App.Locals, ownerId: string): Promise<string | null> {
	const { data } = await locals.supabase.from('profiles').select('current_lake_id').eq('id', ownerId).maybeSingle();
	return (data as { current_lake_id: string | null } | null)?.current_lake_id ?? null;
}
