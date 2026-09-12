import { fail, redirect } from '@sveltejs/kit';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from '../gates/requireUser';
import { loadMyWaters } from '../queries/loadMyWaters';

const ReturnPaths = ['/home', '/lake'];
const DefaultReturn = '/lake';

export async function SwitchWater(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const lakeId = String(formData.get('lakeId') ?? '');
	const waters = await loadMyWaters(locals, user.id);
	const wanted = waters.find((water) => water.id === lakeId);
	if (!wanted) return fail(400, { message: 'That is not one of your waters' });
	const { error } = await trustedSupabase().from('profiles').update({ current_lake_id: wanted.id }).eq('id', user.id);
	if (error) return fail(500, { message: error.message });
	redirect(303, returnPathFrom(formData));
}

function returnPathFrom(formData: FormData) {
	const requested = String(formData.get('returnTo') ?? '');
	return ReturnPaths.includes(requested) ? requested : DefaultReturn;
}
