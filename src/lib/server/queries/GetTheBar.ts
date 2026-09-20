import type { TheBar } from '$lib/domain/fishing/honours';
import type { Lake } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';
import { GetStandingRecords } from './GetStandingRecords';
import { loadCurrentFishermanId, loadHeaviestBefore, loadPersonalBestOf } from './loadPersonalBest';

export async function GetTheBar(locals: App.Locals, lake: Pick<Lake, 'id' | 'region'>, visitedAt: string): Promise<TheBar> {
	const user = requireUser(locals);
	const [standing, fishermanId] = await Promise.all([GetStandingRecords(locals.supabase, lake), loadCurrentFishermanId(locals, user.id)]);
	if (!fishermanId) return { standing, personalBestLb: 0, pedigreeLb: 0 };
	const [personalBestLb, pedigreeLb] = await Promise.all([loadPersonalBestOf(locals, fishermanId), loadHeaviestBefore(locals, fishermanId, visitedAt)]);
	return { standing, personalBestLb, pedigreeLb };
}
