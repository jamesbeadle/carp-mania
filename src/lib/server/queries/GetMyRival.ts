import { WorldScope } from '$lib/contracts/Leaderboards';
import type { BoardNeighbour, MyRival } from '$lib/contracts/Rivalry';
import { requireUser } from '../gates/requireUser';
import { loadAnglerStanding } from './loadTheStanding';

type NeighbourRow = { side: 'above' | 'below'; angler_id: string; display_name: string; avatar_url: string | null; best_lb: number; rank: number };

export async function GetMyRival(locals: App.Locals): Promise<MyRival> {
	const user = requireUser(locals);
	const [standing, neighbours] = await Promise.all([loadAnglerStanding(locals, WorldScope), loadBoardNeighbours(locals, user.id)]);
	return { standing, above: neighbours.get('above') ?? null, below: neighbours.get('below') ?? null };
}

async function loadBoardNeighbours(locals: App.Locals, anglerId: string) {
	const { data } = await locals.supabase.rpc('board_neighbours', { angler: anglerId });
	const rows = (data ?? []) as NeighbourRow[];
	return new Map(rows.map((row) => [row.side, neighbourFrom(row)]));
}

function neighbourFrom(row: NeighbourRow): BoardNeighbour {
	return { anglerId: row.angler_id, displayName: row.display_name, avatarUrl: row.avatar_url, bestLb: Number(row.best_lb), rank: row.rank };
}
