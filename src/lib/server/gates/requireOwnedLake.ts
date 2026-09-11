import { error } from '@sveltejs/kit';
import type { Lake } from '$lib/domain/types';
import { requireUser } from './requireUser';

export async function requireOwnedLake(locals: App.Locals): Promise<Lake> {
	const user = requireUser(locals);
	const { data: lake } = await locals.supabase.from('lakes').select('*').eq('owner_id', user.id).maybeSingle();
	if (!lake) error(404, 'You do not have a fishery yet');
	return lake as Lake;
}
