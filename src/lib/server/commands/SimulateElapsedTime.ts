import { nothingHappened, type WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
import { summariseEstate, type WaterSummary } from '$lib/domain/estate/summariseEstate';
import type { StandingRecords } from '$lib/domain/market/records';
import type { Shoal } from '$lib/domain/stock/shoals';
import type { Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
import { seededRandom } from '$lib/domain/random';
import { fisheryDaysElapsedSince, FisheryClock, simulatedUntilAfter } from '$lib/domain/simulation/elapsedDays';
import { simulateOneDay, type DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import type { Carp, Lake, Profile } from '$lib/domain/types';
import { seasonFor } from '$lib/domain/world/seasons';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { GetStandingRecords } from '../queries/GetStandingRecords';
import { loadMyWaters } from '../queries/loadMyWaters';
import { loadLakeLife, type LakeLife } from '../queries/loadLakeLife';
import { persistSimulatedDays } from './persistSimulatedDays';
import { ProvisionalIds } from './persistStock';
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
	let currentLake = lake;
	let currentCarp = life.carp;
	let currentShoals = life.shoals;
	let currentBailiffs = life.bailiffs;
	let currentRecords = records;
	let currentWorks = life.works;
	for (let day = 0; day < days; day++) {
		const dayStart = new Date(new Date(lake.simulated_until).getTime() + day * FisheryClock.RealMillisecondsPerFisheryDay);
		const dayEnd = new Date(dayStart.getTime() + FisheryClock.RealMillisecondsPerFisheryDay);
		const outcome = simulateOneDay(currentLake, currentCarp, life.swims, random, { dayStart, dayEnd, season: seasonFor(currentLake, dayStart), records: currentRecords, works: currentWorks, bookings: life.bookings, book: life.book, bailiffs: currentBailiffs }, currentShoals);
		outcomes.push(outcome);
		currentLake = outcome.lake;
		currentCarp = [...outcome.carp, ...namedAsRows(outcome, currentLake)];
		currentShoals = [...outcome.shoals, ...fryAsRows(outcome, day)];
		currentBailiffs = outcome.bailiffs;
		currentRecords = outcome.records;
		const completedIds = new Set(outcome.worksCompleted.map((completed) => completed.id));
		currentWorks = currentWorks.filter((work) => !completedIds.has(work.id));
	}
	return outcomes;
}

function namedAsRows(outcome: DayOutcome, lake: Lake): Carp[] {
	const named = outcome.carp.length;
	return outcome.namedFromShoals.map((fish, index) => ({ ...fish, id: `${ProvisionalIds.NamedFish}${lake.id}-${named}-${index}` }));
}

function fryAsRows(outcome: DayOutcome, day: number): Shoal[] {
	return outcome.fryShoals.map((fry, index) => ({ ...fry, id: `${ProvisionalIds.FryShoal}${day}-${index}` }));
}
