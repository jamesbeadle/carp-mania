import { requireUser } from '../gates/requireUser';

export async function GetMyLakeId(locals: App.Locals): Promise<string | null> {
	const user = requireUser(locals);
	const { data: lake } = await locals.supabase.from('lakes').select('id').eq('owner_id', user.id).maybeSingle();
	return (lake as { id: string } | null)?.id ?? null;
}
