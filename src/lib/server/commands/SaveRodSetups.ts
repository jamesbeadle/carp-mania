import { error, json } from '@sveltejs/kit';
import { readRodSetups } from '../gates/readRodSetups';
import { requireUser } from '../gates/requireUser';

export async function SaveRodSetups(locals: App.Locals, candidate: unknown) {
	const user = requireUser(locals);
	const { setups, failure } = readRodSetups(candidate);
	if (failure) error(failure.status, failure.data.message);

	const { error: saveError } = await locals.supabase.from('profiles').update({ saved_rods: setups }).eq('id', user.id);
	if (saveError) error(500, saveError.message);
	return json({ savedRodCount: setups.length });
}
