import { fail } from '@sveltejs/kit';
import { whyCannotEnter } from '$lib/domain/matches/matchRules';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { GetMatch } from '../queries/GetMatch';

const MatchIdField = 'matchId';
const YouAreIn = "You're in. Fish the match from the water's page once it starts.";

export async function EnterMatch(locals: App.Locals, formData: FormData) {
	const matchId = String(formData.get(MatchIdField) ?? '');
	const page = await GetMatch(locals, matchId);
	const refusal = whyCannotEnter(page.card.match, page.card.entryCount, page.card.isEntered, new Date());
	if (refusal) return fail(400, { message: refusal });
	const shortfall = moneyShortfall(await loadProfile(locals), Number(page.card.match.entry_fee));
	if (shortfall) return shortfall;

	const { error } = await locals.supabase.rpc('enter_match', { match: matchId });
	if (error) return fail(400, { message: error.message });
	return { message: YouAreIn };
}
