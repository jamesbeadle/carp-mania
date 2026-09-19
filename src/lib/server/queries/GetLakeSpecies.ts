import type { LakeSpecies } from '$lib/domain/water/species';

export async function loadSpeciesOf(locals: App.Locals, lakeId: string): Promise<LakeSpecies[]> {
	const { data } = await locals.supabase.from('lake_species').select('*').eq('lake_id', lakeId);
	return ((data ?? []) as LakeSpecies[]).map((line) => ({ ...line, count: Number(line.count) }));
}
