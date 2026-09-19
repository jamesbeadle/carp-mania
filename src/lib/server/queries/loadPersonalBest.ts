export async function loadPersonalBestOf(locals: App.Locals, fishermanId: string): Promise<number> {
	const { data } = await locals.supabase.from('catches').select('weight_lb').eq('fisherman_id', fishermanId).order('weight_lb', { ascending: false }).limit(1).maybeSingle();
	return data ? Number((data as { weight_lb: number }).weight_lb) : 0;
}

export async function loadCurrentFishermanId(locals: App.Locals, profileId: string): Promise<string | null> {
	const { data } = await locals.supabase.from('profiles').select('current_fisherman_id').eq('id', profileId).maybeSingle();
	return (data as { current_fisherman_id: string | null } | null)?.current_fisherman_id ?? null;
}

export async function loadHeaviestBefore(locals: App.Locals, fishermanId: string, before: string): Promise<number> {
	const { data } = await locals.supabase.from('catches').select('weight_lb').eq('fisherman_id', fishermanId).lt('caught_at', before).order('weight_lb', { ascending: false }).limit(1).maybeSingle();
	return data ? Number((data as { weight_lb: number }).weight_lb) : 0;
}
