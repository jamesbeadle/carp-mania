import { nothingHappened, type WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
import { summariseEstate, type WaterSummary } from '$lib/domain/estate/summariseEstate';
import type { StandingRecords } from '$lib/domain/market/records';
import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
import type { BookedWindow } from '$lib/domain/matches/bookings';
import { seededRandom } from '$lib/domain/random';
import { fisheryDaysElapsedSince, FisheryClock, simulatedUntilAfter } from '$lib/domain/simulation/elapsedDays';
import { simulateOneDay, type DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
import { seasonFor } from '$lib/domain/world/seasons';
import type { LakeWork } from '$lib/domain/worldTypes';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { GetStandingRecords } from '../queries/GetStandingRecords';
import { GetTicketBook } from '../queries/GetTicketBook';
import { loadBookings } from '../queries/loadBookings';
import { loadMyWaters } from '../queries/loadMyWaters';
import { loadWorksInProgress } from '../queries/loadWorksInProgress';
import { persistSimulatedDays } from './persistSimulatedDays';
import { summariseDays } from './summariseDays';

interface LakeLife {
	carp: Carp[];
	swims: Swim[];
	works: LakeWork[];
	bookings: BookedWindow[];
	book: TicketProduct[];
}

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
	await persistSimulatedDays(trusted, finalLake, outcomes, profile);
	return summariseDays(outcomes);
}

function runDays(lake: Lake, life: LakeLife, days: number, records: StandingRecords) {
	const random = seededRandom(new Date(lake.simulated_until).getTime());
	const outcomes: DayOutcome[] = [];
	let currentLake = lake;
	let currentCarp = life.carp;
	let currentRecords = records;
	let currentWorks = life.works;
	for (let day = 0; day < days; day++) {
		const dayStart = new Date(new Date(lake.simulated_until).getTime() + day * FisheryClock.RealMillisecondsPerFisheryDay);
		const dayEnd = new Date(dayStart.getTime() + FisheryClock.RealMillisecondsPerFisheryDay);
		const outcome = simulateOneDay(currentLake, currentCarp, life.swims, random, { dayStart, dayEnd, season: seasonFor(currentLake, dayStart), records: currentRecords, works: currentWorks, bookings: life.bookings, book: life.book });
		outcomes.push(outcome);
		currentLake = outcome.lake;
		currentCarp = outcome.carp;
		currentRecords = outcome.records;
		currentWorks = currentWorks.filter((work) => !outcome.worksCompleted.some((completed) => completed.id === work.id));
	}
	return outcomes;
}

async function loadLakeLife(locals: App.Locals, lake: Lake): Promise<LakeLife> {
	const [{ data: carp }, { data: swims }, works, bookings, book] = await Promise.all([
		locals.supabase.from('carp').select('*').eq('lake_id', lake.id),
		locals.supabase.from('swims').select('*').eq('lake_id', lake.id),
		loadWorksInProgress(locals, lake.id),
		loadBookings(locals, lake.id, lake.simulated_until),
		GetTicketBook(locals, lake.id)
	]);
	return { carp: (carp ?? []) as Carp[], swims: (swims ?? []) as Swim[], works, bookings, book };
}
