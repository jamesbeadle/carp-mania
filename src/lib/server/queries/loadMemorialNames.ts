import type { CarpMemorial } from '$lib/domain/memorialTypes';

type NamedRow = Pick<CarpMemorial, 'id' | 'name'>;

export async function loadMemorialNames(locals: App.Locals, carpIds: string[]): Promise<Record<string, string>> {
	if (carpIds.length === 0) return {};
	const { data: remembered } = await locals.supabase.from('carp_memorial').select('id, name').in('id', carpIds);
	return Object.fromEntries(((remembered ?? []) as NamedRow[]).map((fish) => [fish.id, fish.name]));
}

export async function loadMemorial(locals: App.Locals, carpId: string): Promise<CarpMemorial | null> {
	const { data: remembered } = await locals.supabase.from('carp_memorial').select('*').eq('id', carpId).maybeSingle();
	return (remembered as CarpMemorial | null) ?? null;
}
