import { fail } from '@sveltejs/kit';
import { requireUser } from './requireUser';

export async function hasLakeAlready(locals: App.Locals) {
	const user = requireUser(locals);
	const { count } = await locals.supabase.from('lakes').select('id', { count: 'exact', head: true }).eq('owner_id', user.id);
	return (count ?? 0) > 0;
}

export function alreadyHasAWater() {
	return fail(400, { message: 'You already have a water — run it from My fishery' });
}
