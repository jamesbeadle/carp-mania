export async function loadStillSwimming(locals: App.Locals, carpIds: (string | null)[]): Promise<Set<string>> {
	const ids = [...new Set(carpIds.filter((carpId): carpId is string => carpId !== null))];
	if (ids.length === 0) return new Set();
	const { data } = await locals.supabase.from('carp').select('id').in('id', ids);
	return new Set(((data ?? []) as { id: string }[]).map((fish) => fish.id));
}
