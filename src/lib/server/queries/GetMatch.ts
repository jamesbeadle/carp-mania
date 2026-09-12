import { error } from '@sveltejs/kit';
import type { MatchPage } from '$lib/contracts/MatchPage';
import { prizesFor, whyCannotEnter } from '$lib/domain/matches/matchRules';
import type { BoardPlacing, Trophy } from '$lib/domain/matches/matchTypes';
import { requireUser } from '../gates/requireUser';
import { loadCarpNames } from './loadAnglerCatches';
import { loadEnteredMatchIds, matchCardFrom, MatchWithParties, type MatchRow } from './matchCards';

const NoSuchMatch = 'There is no such match';

type BoardRow = { angler_id: string; angler_name: string; fisherman_id: string | null; catches: number; heaviest_lb: number; heaviest_carp_id: string | null };

export async function GetMatch(locals: App.Locals, matchId: string): Promise<MatchPage> {
	const user = requireUser(locals);
	const now = new Date();
	const [{ data: row }, entered, board, trophies] = await Promise.all([
		locals.supabase.from('matches').select(MatchWithParties).eq('id', matchId).maybeSingle(),
		loadEnteredMatchIds(locals, user.id),
		loadBoard(locals, matchId),
		loadTrophiesOfMatch(locals, matchId)
	]);
	if (!row) error(404, NoSuchMatch);
	const card = matchCardFrom(row as unknown as MatchRow, user.id, entered, now);
	const carpNames = await loadCarpNames(locals, board.map((placing) => placing.heaviestCarpId));
	return {
		card,
		board,
		carpNames,
		trophies,
		prizes: prizesFor(card.pot, card.match.most_catches_share),
		whyCannotEnter: whyCannotEnter(card.match, card.entryCount, card.isEntered, now),
		loadedAt: now.toISOString()
	};
}

async function loadBoard(locals: App.Locals, matchId: string): Promise<BoardPlacing[]> {
	const { data } = await locals.supabase.rpc('match_board', { match: matchId });
	return ((data ?? []) as BoardRow[]).map((placing) => ({
		anglerId: placing.angler_id,
		anglerName: placing.angler_name,
		fishermanId: placing.fisherman_id,
		catches: Number(placing.catches),
		heaviestLb: Number(placing.heaviest_lb),
		heaviestCarpId: placing.heaviest_carp_id
	}));
}

async function loadTrophiesOfMatch(locals: App.Locals, matchId: string): Promise<Trophy[]> {
	const { data } = await locals.supabase.from('trophies').select('*').eq('match_id', matchId).order('kind');
	return (data ?? []) as Trophy[];
}
