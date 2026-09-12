import type { MatchCard } from '$lib/contracts/MatchCard';
import { requireUser } from '../gates/requireUser';
import { loadEnteredMatchIds, loadOpenMatchesAt, matchCardFrom } from './matchCards';

export async function GetMatchesAtWater(locals: App.Locals, lakeId: string): Promise<MatchCard[]> {
	const user = requireUser(locals);
	const now = new Date();
	const [rows, entered] = await Promise.all([loadOpenMatchesAt(locals, lakeId), loadEnteredMatchIds(locals, user.id)]);
	return rows.map((row) => matchCardFrom(row, user.id, entered, now));
}

export function runningMatchAmong(cards: MatchCard[]): MatchCard | null {
	return cards.find((card) => card.phase === 'in_play') ?? null;
}
