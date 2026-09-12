import type { MatchCard } from '$lib/contracts/MatchCard';
import { requireUser } from '../gates/requireUser';
import { loadEnteredMatchIds, matchCardFrom, MatchWithParties, type MatchRow } from './matchCards';

export async function GetMyNextMatch(locals: App.Locals): Promise<MatchCard | null> {
	const user = requireUser(locals);
	const entered = await loadEnteredMatchIds(locals, user.id);
	const { data } = await locals.supabase
		.from('matches')
		.select(MatchWithParties)
		.eq('status', 'open')
		.or(mineOrEntered(user.id, entered))
		.order('starts_at')
		.limit(1)
		.maybeSingle();
	if (!data) return null;
	return matchCardFrom(data as unknown as MatchRow, user.id, entered, new Date());
}

function mineOrEntered(hostId: string, entered: Set<string>) {
	const hosting = `host_id.eq.${hostId}`;
	if (entered.size === 0) return hosting;
	return `${hosting},id.in.(${[...entered].join(',')})`;
}
