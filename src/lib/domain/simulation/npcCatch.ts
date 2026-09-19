import { carpOfTaker } from '../fishing/takers';
import { conditionsShareFor } from '../fishing/weatherConditions';
import { fameForNpcCatch } from '../market/fame';
import { raiseRecords, recordsBrokenBy } from '../market/records';
import { pickRandom, type RandomFraction } from '../random';
import { BaitNames } from '../tackle/baits';
import { HookSizes } from '../tackle/hooks';
import { RigNames } from '../tackle/rigs';
import type { Carp, Lake, Swim } from '../types';
import type { AnglerDay, VisitingDay } from './visitingAnglers';
import { takerForVisitor } from './visitorTake';

const HoursInADay = 24;
const UnknownSwim = 'Unknown swim';

export function recordNpcCatch(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, anglerName: string, rating: number, today: VisitingDay, day: AnglerDay) {
	const hour = random() * HoursInADay;
	const taker = takerForVisitor(lake, carp, today.shoals, rating, hour, conditionsShareFor(hour, today.weather), random);
	if (!taker) return;
	const fish = taker.kind === 'named' ? taker.carp : null;
	const weightLb = Number(carpOfTaker(taker)?.weight_lb ?? 0);
	const records = recordsBrokenBy(weightLb, day.records);
	if (fish) rememberTheCatch(fish, weightLb, records);
	day.records = raiseRecords(weightLb, day.records);
	day.catches.push({
		lake_id: lake.id,
		carp_id: fish?.id ?? null,
		angler_id: null,
		angler_name: anglerName,
		weight_lb: weightLb,
		swim_name: swims.length > 0 ? pickRandom(random, swims).name : UnknownSwim,
		rig: pickRandom(random, RigNames),
		bait: pickRandom(random, BaitNames),
		hook_size: pickRandom(random, HookSizes)
	});
}

function rememberTheCatch(fish: Carp, weightLb: number, records: ReturnType<typeof recordsBrokenBy>) {
	fish.times_caught += 1;
	fish.is_catalogued = true;
	fish.fame += fameForNpcCatch(weightLb, records);
}
