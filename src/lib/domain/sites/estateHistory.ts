import { randomAnglerName } from '../naming/anglerNames';
import { pickRandom, randomBetween, type RandomFraction } from '../random';
import { FisheryClock } from '../simulation/elapsedDays';
import { BaitNames } from '../tackle/baits';
import { HookSizes } from '../tackle/hooks';
import { RigNames } from '../tackle/rigs';
import type { Carp, Catch, Lake } from '../types';
import { SiteTemplates } from './siteTemplates';

export const HistoryCatchesPerDay = { Minimum: 2, Maximum: 5 } as const;
const PreviousOwner = 'The old estate';

export type NewCatch = Omit<Catch, 'id'>;

export interface EstateHistory {
	catches: NewCatch[];
	carp: Carp[];
}

export function estateCatchHistory(lake: Pick<Lake, 'id' | 'site_type' | 'simulated_until'>, carp: Carp[], days: number, random: RandomFraction): EstateHistory {
	const history = carp.map((fish) => ({ ...fish }));
	const fishable = history.filter((fish) => fish.is_catalogued);
	if (days === 0 || fishable.length === 0) return { catches: [], carp: history };

	const swimNames = SiteTemplates[lake.site_type].swims().map((peg) => peg.name);
	const end = new Date(lake.simulated_until).getTime();
	const catches: NewCatch[] = [];
	for (let dayIndex = 0; dayIndex < days; dayIndex++) {
		const dayStart = end - (days - dayIndex) * FisheryClock.RealMillisecondsPerFisheryDay;
		catches.push(...catchesForOneDay(lake.id, fishable, swimNames, dayStart, random));
	}
	return { catches, carp: history };
}

function catchesForOneDay(lakeId: string, fishable: Carp[], swimNames: string[], dayStart: number, random: RandomFraction): NewCatch[] {
	const count = Math.round(randomBetween(random, HistoryCatchesPerDay.Minimum, HistoryCatchesPerDay.Maximum));
	return Array.from({ length: count }, (_, catchIndex) => {
		const fish = pickRandom(random, fishable);
		fish.times_caught += 1;
		const caughtAt = dayStart + ((catchIndex + 1) / (count + 1)) * FisheryClock.RealMillisecondsPerFisheryDay;
		return oneCatch(lakeId, fish, swimNames, new Date(caughtAt), random);
	});
}

function oneCatch(lakeId: string, fish: Carp, swimNames: string[], caughtAt: Date, random: RandomFraction): NewCatch {
	return {
		lake_id: lakeId,
		carp_id: fish.id,
		angler_id: null,
		angler_name: randomAnglerName(random(), random()),
		owner_name: PreviousOwner,
		weight_lb: Number(fish.weight_lb),
		swim_name: pickRandom(random, swimNames),
		rig: pickRandom(random, RigNames),
		bait: pickRandom(random, BaitNames),
		hook_size: pickRandom(random, HookSizes),
		caught_at: caughtAt.toISOString()
	};
}
