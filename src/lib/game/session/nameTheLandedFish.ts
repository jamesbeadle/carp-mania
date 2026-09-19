import type { Carp, Profile } from '$lib/domain/types';
import { reportLandedFish, type CatchReportOutcome, type LandedFish } from './landFish';
import type { SessionState } from './sessionState.svelte';

export async function reportAndNameTheFish(session: SessionState, lakeId: string, visitId: string, profile: Profile, landed: LandedFish): Promise<CatchReportOutcome> {
	const outcome = await reportLandedFish(lakeId, visitId, profile, landed);
	if (outcome.carp) nameTheLandedFish(session, landed, outcome.carp);
	return outcome;
}

export function nameTheLandedFish(session: SessionState, landed: LandedFish, named: Carp) {
	const withName = { ...landed, carp: named };
	session.landedToday = session.landedToday.map((fish) => (fish === landed ? withName : fish));
	if (session.lastLanded === landed) session.lastLanded = withName;
}
