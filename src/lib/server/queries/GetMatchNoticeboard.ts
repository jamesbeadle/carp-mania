import type { MatchCard, MatchNoticeboard } from '$lib/contracts/MatchCard';
import { requireUser } from '../gates/requireUser';
import { loadCurrentLakeId } from './loadMyWaters';
import { loadEnteredMatchIds, matchCardFrom, MatchWithParties, type MatchRow } from './matchCards';

const RecentlySettledLimit = 10;
const Newest = { ascending: false } as const;

export async function GetMatchNoticeboard(locals: App.Locals): Promise<MatchNoticeboard> {
	const user = requireUser(locals);
	const now = new Date();
	const [{ data: open }, { data: over }, entered, myWaterId] = await Promise.all([
		locals.supabase.from('matches').select(MatchWithParties).eq('status', 'open').order('starts_at'),
		locals.supabase.from('matches').select(MatchWithParties).neq('status', 'open').order('settled_at', Newest).limit(RecentlySettledLimit),
		loadEnteredMatchIds(locals, user.id),
		loadCurrentLakeId(locals, user.id)
	]);
	const cards = (rows: unknown) => ((rows ?? []) as MatchRow[]).map((row) => matchCardFrom(row, user.id, entered, now));
	const openCards = cards(open);
	return {
		inPlay: openCards.filter(isUnderway),
		comingUp: openCards.filter((card) => card.phase === 'upcoming'),
		recentlySettled: cards(over),
		myWaterId,
		loadedAt: now.toISOString()
	};
}

function isUnderway(card: MatchCard) {
	return card.phase === 'in_play' || card.phase === 'ended';
}
