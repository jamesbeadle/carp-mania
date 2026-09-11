import { seededRandom } from '$lib/domain/random';
import { fisheryDaysElapsedSince, simulatedUntilAfter } from '$lib/domain/simulation/elapsedDays';
import { simulateOneDay, type DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import type { Carp, Lake, Swim } from '$lib/domain/types';
import { loadProfile } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { persistSimulatedDays } from './persistSimulatedDays';
import type { WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';

export async function SimulateElapsedTime(locals: App.Locals): Promise<WhileYouWereAway> {
	const lake = await requireOwnedLake(locals);
	const daysToSimulate = fisheryDaysElapsedSince(lake.simulated_until, new Date());
	if (daysToSimulate === 0) return nothingHappened();

	const { carp, swims } = await loadLakeLife(locals, lake);
	const outcomes = runDays(lake, carp, swims, daysToSimulate);
	const finalLake = { ...outcomes[outcomes.length - 1].lake, simulated_until: simulatedUntilAfter(lake.simulated_until, daysToSimulate) };
	const profile = await loadProfile(locals);
	await persistSimulatedDays(locals, finalLake, outcomes, profile);
	return summarise(outcomes);
}

function runDays(lake: Lake, carp: Carp[], swims: Swim[], days: number) {
	const random = seededRandom(new Date(lake.simulated_until).getTime());
	const outcomes: DayOutcome[] = [];
	let currentLake = lake;
	let currentCarp = carp;
	for (let day = 0; day < days; day++) {
		const outcome = simulateOneDay(currentLake, currentCarp, swims, random);
		outcomes.push(outcome);
		currentLake = outcome.lake;
		currentCarp = outcome.carp;
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

function summarise(outcomes: DayOutcome[]): WhileYouWereAway {
	return {
		daysSimulated: outcomes.length,
		anglersVisited: outcomes.reduce((total, day) => total + day.visits.length, 0),
		fishCaught: outcomes.reduce((total, day) => total + day.catches.length, 0),
		feesCollected: outcomes.reduce((total, day) => total + day.feesCollected, 0),
		bailiffWages: outcomes.reduce((total, day) => total + day.bailiffWages, 0),
		carpTakenByPike: outcomes.flatMap((day) => day.carpTakenByPike.map((fish) => fish.name))
	};
}

function nothingHappened(): WhileYouWereAway {
	return { daysSimulated: 0, anglersVisited: 0, fishCaught: 0, feesCollected: 0, bailiffWages: 0, carpTakenByPike: [] };
}
