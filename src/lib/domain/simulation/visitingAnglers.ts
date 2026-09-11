import { FeeCollection } from '../economy';
import { randomAnglerName } from '../naming/anglerNames';
import { pickRandom, randomBetween, type RandomFraction } from '../random';
import { anglersPerDayFor, typicalAnglerSkillFor } from '../reputation';
import { BaitNames } from '../tackle/baits';
import { HookSizes } from '../tackle/hooks';
import { RigNames } from '../tackle/rigs';
import type { Carp, Catch, Lake, LakeVisit, Swim } from '../types';
import { lakeConfidenceFactor } from '../fishing/biteChance';
import { pickCarpThatTookTheBait } from '../fishing/pickCarp';

const GoodAnglerCatchesPerDay = 19;

export type NewCatch = Omit<Catch, 'id' | 'caught_at'>;
export type NewVisit = Omit<LakeVisit, 'id' | 'visited_at'>;

export function willingnessToPayFor(reputation: number) {
	return 10 + reputation * 0.6;
}

export function anglersArrivingToday(lake: Lake) {
	const wanting = anglersPerDayFor(lake.reputation);
	const affordability = Math.min(1, willingnessToPayFor(lake.reputation) / Math.max(1, lake.day_ticket_fee));
	return Math.max(0, Math.round(wanting * Math.max(0.2, affordability)));
}

export function simulateVisitingAnglers(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction) {
	const visits: NewVisit[] = [];
	const catches: NewCatch[] = [];
	const count = anglersArrivingToday(lake);
	for (let index = 0; index < count; index++) {
		const visit = simulateOneAngler(lake, carp, swims, random, catches);
		visits.push(visit);
	}
	return { visits, catches };
}

function simulateOneAngler(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, catches: NewCatch[]): NewVisit {
	const anglerName = randomAnglerName(random(), random());
	const skill = Math.min(100, Math.max(5, typicalAnglerSkillFor(lake.reputation) + randomBetween(random, -20, 20)));
	const fishCaught = Math.round(GoodAnglerCatchesPerDay * (skill / 100) * lakeConfidenceFactor(lake) * randomBetween(random, 0.4, 1.1));
	for (let index = 0; index < fishCaught; index++) recordNpcCatch(lake, carp, swims, random, anglerName, catches);
	const collectionRate = lake.has_bailiff ? FeeCollection.WithBailiff : FeeCollection.WithoutBailiff;
	const isFeePaid = random() < collectionRate;
	return { lake_id: lake.id, angler_id: null, angler_name: anglerName, fee_paid: isFeePaid ? lake.day_ticket_fee : 0, fish_caught: fishCaught };
}

function recordNpcCatch(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, anglerName: string, catches: NewCatch[]) {
	const fish = pickCarpThatTookTheBait(carp, random());
	if (!fish) return;
	fish.times_caught += 1;
	catches.push({
		lake_id: lake.id,
		carp_id: fish.id,
		angler_id: null,
		angler_name: anglerName,
		weight_lb: fish.weight_lb,
		swim_name: swims.length > 0 ? pickRandom(random, swims).name : 'Unknown swim',
		rig: pickRandom(random, RigNames),
		bait: pickRandom(random, BaitNames),
		hook_size: pickRandom(random, HookSizes)
	});
}
