import type { RodSet } from '$lib/domain/tackle/rodSets';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';

type RodSetRow = { id: string; name: string; rods: RodSetup[]; last_used_at: string };

export async function loadRodSets(locals: App.Locals, profileId: string): Promise<RodSet[]> {
	const { data } = await locals.supabase.from('rod_sets').select('id, name, rods, last_used_at').eq('profile_id', profileId).order('last_used_at', { ascending: false });
	return ((data ?? []) as RodSetRow[]).map((row) => ({ id: row.id, name: row.name, rods: row.rods, lastUsedAt: row.last_used_at }));
}
