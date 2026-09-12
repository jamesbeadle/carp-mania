import type { TheBar } from '$lib/domain/fishing/honours';
import type { Lake } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';
import { GetStandingRecords } from './GetStandingRecords';
import { loadCurrentFishermanId, loadPersonalBestOf } from './loadPersonalBest';

export async function GetTheBar(locals: App.Locals, lake: Pick<Lake, 'id' | 'region'>): Promise<TheBar> {
	const user = requireUser(locals);
	const [standing, fishermanId] = await Promise.all([GetStandingRecords(locals.supabase, lake), loadCurrentFishermanId(locals, user.id)]);
	const personalBestLb = fishermanId ? await loadPersonalBestOf(locals, fishermanId) : 0;
	return { standing, personalBestLb };
}
