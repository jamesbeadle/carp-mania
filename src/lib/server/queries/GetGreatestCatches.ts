import type { HallOfFameCatch } from '$lib/contracts/HallOfFame';
import { WorldScope } from '$lib/contracts/Leaderboards';
import { requireUser } from '../gates/requireUser';
import { loadBiggestByAnAngler } from './GetHallOfFame';

export async function GetGreatestCatches(locals: App.Locals): Promise<HallOfFameCatch[]> {
	requireUser(locals);
	return loadBiggestByAnAngler(locals, WorldScope);
}
