import { fail } from '@sveltejs/kit';
import { requireUser } from '../gates/requireUser';

const MatchIdField = 'matchId';
const CalledOff = 'The match is off; every entry fee and your stake are back where they came from. The booking fee is spent.';

export async function CancelMatch(locals: App.Locals, formData: FormData) {
	requireUser(locals);
	const matchId = String(formData.get(MatchIdField) ?? '');
	if (matchId === '') return fail(400, { message: 'Which match?' });
	const { error } = await locals.supabase.rpc('cancel_match', { match: matchId });
	if (error) return fail(400, { message: error.message });
	return { message: CalledOff };
}
