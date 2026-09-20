import type { AwardsPage } from '$lib/contracts/Awards';
import { nextAwardsFor } from '$lib/domain/trophies/awardProgress';
import { RaiseAwards } from '../commands/RaiseAwards';
import { requireUser } from '../gates/requireUser';
import { loadAwardsHeld, loadAwardTallies } from './loadAwards';

export async function GetAwards(locals: App.Locals, anglerId: string): Promise<AwardsPage> {
	const viewer = requireUser(locals);
	if (viewer.id === anglerId) await RaiseAwards(anglerId);
	const [won, tallies] = await Promise.all([loadAwardsHeld(locals.supabase, anglerId), loadAwardTallies(locals.supabase, anglerId)]);
	return { won, tallies, next: nextAwardsFor(tallies, won.map((award) => award.key)) };
}
