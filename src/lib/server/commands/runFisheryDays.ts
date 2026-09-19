import type { Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
import type { StandingRecords } from '$lib/domain/market/records';
import type { Shoal } from '$lib/domain/stock/shoals';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import type { DayContext, DayOutcome } from '$lib/domain/simulation/dayTypes';
import type { Carp, Lake } from '$lib/domain/types';
import type { LakeWork } from '$lib/domain/worldTypes';
import { seasonFor } from '$lib/domain/world/seasons';
import { fisheryDayNumber } from '$lib/domain/world/worldClock';
import type { LakeLife } from '../queries/loadLakeLife';
import { ProvisionalIds } from './persistStock';

export interface RunningWater {
	lake: Lake;
	carp: Carp[];
	shoals: Shoal[];
	bailiffs: Bailiff[];
	records: StandingRecords;
	works: LakeWork[];
}

export function startOfDay(lake: Lake, day: number) {
	const simulatedUntil = new Date(lake.simulated_until).getTime();
	return new Date(simulatedUntil + day * FisheryClock.RealMillisecondsPerFisheryDay);
}

export function dayContextFor(life: LakeLife, running: RunningWater, dayStart: Date): DayContext {
	const dayEnd = new Date(dayStart.getTime() + FisheryClock.RealMillisecondsPerFisheryDay);
	const season = seasonFor(running.lake, dayStart);
	const pegsBooked = life.pegsBookedByDay[fisheryDayNumber(dayStart)] ?? 0;
	const { bookings, book, species, swims } = life;
	const { records, works, bailiffs } = running;
	return { dayStart, dayEnd, season, records, works, bookings, book, bailiffs, species, swimCount: swims.length, pegsBooked };
}

export function waterAfter(outcome: DayOutcome, running: RunningWater, day: number): RunningWater {
	const completedIds = new Set(outcome.worksCompleted.map((completed) => completed.id));
	return {
		lake: outcome.lake,
		carp: [...outcome.carp, ...namedAsRows(outcome, outcome.lake)],
		shoals: [...outcome.shoals, ...fryAsRows(outcome, day)],
		bailiffs: outcome.bailiffs,
		records: outcome.records,
		works: running.works.filter((work) => !completedIds.has(work.id))
	};
}

function namedAsRows(outcome: DayOutcome, lake: Lake): Carp[] {
	const named = outcome.carp.length;
	const prefix = `${ProvisionalIds.NamedFish}${lake.id}-${named}`;
	return outcome.namedFromShoals.map((fish, index) => ({ ...fish, id: `${prefix}-${index}` }));
}

function fryAsRows(outcome: DayOutcome, day: number): Shoal[] {
	return outcome.fryShoals.map((shoal, index) => ({ ...shoal, id: `${ProvisionalIds.FryShoal}${day}-${index}` }));
}
