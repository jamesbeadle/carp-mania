import { nothingHappened, type WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
import { summariseEstate, type WaterSummary } from '$lib/domain/estate/summariseEstate';
import type { StandingRecords } from '$lib/domain/market/records';
import { seededRandom } from '$lib/domain/random';
import { fisheryDaysElapsedSince, simulatedUntilAfter } from '$lib/domain/simulation/elapsedDays';
import type { DayOutcome } from '$lib/domain/simulation/dayTypes';
import { simulateOneDay } from '$lib/domain/simulation/simulateOneDay';
import type { Lake, Profile } from '$lib/domain/types';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { GetStandingRecords } from '../queries/GetStandingRecords';
import { loadMyWaters } from '../queries/loadMyWaters';
import { loadLakeLife, type LakeLife } from '../queries/loadLakeLife';
import { persistSimulatedDays } from './persistSimulatedDays';
import { dayContextFor, startOfDay, waterAfter, type RunningWater } from './runFisheryDays';
import { summariseDays } from './summariseDays';

export async function SimulateElapsedTime(locals: App.Locals): Promise<WhileYouWereAway> {
	const user = requireUser(locals);
	const openWaters = (await loadMyWaters(locals, user.id)).filter((water) => water.is_setup_complete);
	if (openWaters.length === 0) return nothingHappened();
	const profile = await loadProfile(locals);
	const summaries: WaterSummary[] = [];
	for (const lake of openWaters) summaries.push({ waterName: lake.name, summary: await simulateWater(locals, lake, profile) });
	return summariseEstate(summaries);
}

async function simulateWater(locals: App.Locals, lake: Lake, profile: Profile): Promise<WhileYouWereAway> {
	const daysToSimulate = fisheryDaysElapsedSince(lake.simulated_until, new Date());
	if (daysToSimulate === 0) return nothingHappened();
	const trusted = trustedSupabase();
	const [life, records] = await Promise.all([loadLakeLife(locals, lake), GetStandingRecords(trusted, lake)]);
	const outcomes = runDays(lake, life, daysToSimulate, records);
	const finalLake = { ...outcomes[outcomes.length - 1].lake, simulated_until: simulatedUntilAfter(lake.simulated_until, daysToSimulate) };
	await persistSimulatedDays(trusted, finalLake, outcomes, profile, { carp: life.carp, shoals: life.shoals });
	return summariseDays(outcomes);
}

function runDays(lake: Lake, life: LakeLife, days: number, records: StandingRecords) {
	const random = seededRandom(new Date(lake.simulated_until).getTime());
	const outcomes: DayOutcome[] = [];
	const { carp, shoals, bailiffs, works, hasOpenBounty } = life;
	let running: RunningWater = { lake, carp, shoals, bailiffs, records, works, hasOpenBounty };
	for (let day = 0; day < days; day++) {
		const context = dayContextFor(life, running, startOfDay(lake, day));
		const outcome = simulateOneDay(running.lake, running.carp, life.swims, random, context, running.shoals);
		outcomes.push(outcome);
		running = waterAfter(outcome, running, day);
	}
	return outcomes;
}
