import { requireUser } from '../gates/requireUser';

export async function GetMyFavourites(locals: App.Locals): Promise<string[]> {
	const user = requireUser(locals);
	const { data: rows } = await locals.supabase.from('favourite_lakes').select('lake_id').eq('profile_id', user.id);
	return ((rows ?? []) as { lake_id: string }[]).map((row) => row.lake_id);
}
