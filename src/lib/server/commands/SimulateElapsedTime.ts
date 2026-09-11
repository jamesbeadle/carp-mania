import { nothingHappened, type WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
import type { StandingRecords } from '$lib/domain/market/records';
import { seededRandom } from '$lib/domain/random';
import { fisheryDaysElapsedSince, FisheryClock, simulatedUntilAfter } from '$lib/domain/simulation/elapsedDays';
import { simulateOneDay, type DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import type { Carp, Lake, Swim } from '$lib/domain/types';
import { seasonFor } from '$lib/domain/world/seasons';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { GetStandingRecords } from '../queries/GetStandingRecords';
import { persistSimulatedDays } from './persistSimulatedDays';
import { summariseDays } from './summariseDays';

export async function SimulateElapsedTime(locals: App.Locals): Promise<WhileYouWereAway> {
	const lake = await requireOwnedLake(locals);
	const daysToSimulate = fisheryDaysElapsedSince(lake.simulated_until, new Date());
	if (daysToSimulate === 0 || !lake.is_setup_complete) return nothingHappened();

	const trusted = trustedSupabase();
	const [{ carp, swims }, records] = await Promise.all([loadLakeLife(locals, lake), GetStandingRecords(trusted, lake)]);
	const outcomes = runDays(lake, carp, swims, daysToSimulate, records);
	const finalLake = { ...outcomes[outcomes.length - 1].lake, simulated_until: simulatedUntilAfter(lake.simulated_until, daysToSimulate) };
	const profile = await loadProfile(locals);
	await persistSimulatedDays(trusted, finalLake, outcomes, profile);
	return summariseDays(outcomes);
}

function runDays(lake: Lake, carp: Carp[], swims: Swim[], days: number, records: StandingRecords) {
	const random = seededRandom(new Date(lake.simulated_until).getTime());
	const outcomes: DayOutcome[] = [];
	let currentLake = lake;
	let currentCarp = carp;
	let currentRecords = records;
	for (let day = 0; day < days; day++) {
		const dayStart = new Date(new Date(lake.simulated_until).getTime() + day * FisheryClock.RealMillisecondsPerFisheryDay);
		const dayEnd = new Date(dayStart.getTime() + FisheryClock.RealMillisecondsPerFisheryDay);
		const outcome = simulateOneDay(currentLake, currentCarp, swims, random, { dayStart, dayEnd, season: seasonFor(currentLake, dayStart), records: currentRecords });
		outcomes.push(outcome);
		currentLake = outcome.lake;
		currentCarp = outcome.carp;
		currentRecords = outcome.records;
	}
	return outcomes;
}

async function loadLakeLife(locals: App.Locals, lake: Lake) {
	const [{ data: carp }, { data: swims }] = await Promise.all([
		locals.supabase.from('carp').select('*').eq('lake_id', lake.id),
		locals.supabase.from('swims').select('*').eq('lake_id', lake.id)
	]);
	return { carp: (carp ?? []) as Carp[], swims: (swims ?? []) as Swim[] };
}
