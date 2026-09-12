import { FacilityEffects, FeeCollection } from '../economy';
import { fameForNpcCatch } from '../market/fame';
import { raiseRecords, recordsBrokenBy, type StandingRecords } from '../market/records';
import { randomAnglerName } from '../naming/anglerNames';
import { pickRandom, randomBetween, type RandomFraction } from '../random';
import { anglersPerDayFor, typicalAnglerSkillFor } from '../reputation';
import { BaitNames } from '../tackle/baits';
import { HookSizes } from '../tackle/hooks';
import { RigNames } from '../tackle/rigs';
import type { Carp, Catch, Lake, LakeVisit, Swim } from '../types';
import { lakeConfidenceFactor } from '../fishing/biteChance';
import { pickCarpThatTookTheBait } from '../fishing/pickCarp';
import { RegionCatalogue } from '../world/regions';
import type { Season } from '../world/seasons';
import { isFishable } from './lapseTransfers';

const GoodAnglerCatchesPerDay = 19;

export type NewCatch = Omit<Catch, 'id' | 'caught_at'>;
export type NewVisit = Omit<LakeVisit, 'id' | 'visited_at'>;

export interface AnglerDay {
	visits: NewVisit[];
	catches: NewCatch[];
	records: StandingRecords;
	lodgeTakings: number;
}

export function willingnessToPayFor(reputation: number, region: Lake['region'] = 'uk_ireland') {
	return (10 + reputation * 0.6) * RegionCatalogue[region].willingnessToPayFactor;
}

export function anglersArrivingToday(lake: Lake, season: Pick<Season, 'anglerFactor'> = { anglerFactor: 1 }) {
	const wanting = anglersPerDayFor(Number(lake.reputation)) * RegionCatalogue[lake.region].anglerPoolFactor * season.anglerFactor;
	const carPark = lake.layout.facilities.includes('car_park') ? FacilityEffects.CarParkAnglerFactor : 1;
	const disturbed = 1 - Number(lake.disturbance) / 100;
	const affordability = Math.min(1, willingnessToPayFor(Number(lake.reputation), lake.region) / Math.max(1, Number(lake.day_ticket_fee)));
	return Math.max(0, Math.round(wanting * carPark * disturbed * Math.max(0.2, affordability)));
}

export function simulateVisitingAnglers(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, season: Season, standing: StandingRecords): AnglerDay {
	const day: AnglerDay = { visits: [], catches: [], records: standing, lodgeTakings: 0 };
	const count = anglersArrivingToday(lake, season);
	const fishable = carp.filter(isFishable);
	for (let index = 0; index < count; index++) day.visits.push(simulateOneAngler(lake, fishable, swims, random, season, day));
	day.lodgeTakings = lake.layout.facilities.includes('lodge') ? count * FacilityEffects.LodgeTakingsPerAngler : 0;
	return day;
}

function simulateOneAngler(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, season: Season, day: AnglerDay): NewVisit {
	const anglerName = randomAnglerName(random(), random());
	const skill = Math.min(100, Math.max(5, typicalAnglerSkillFor(Number(lake.reputation)) + randomBetween(random, -20, 20)));
	const fishCaught = Math.round(GoodAnglerCatchesPerDay * (skill / 100) * lakeConfidenceFactor(lake) * season.biteFactor * randomBetween(random, 0.4, 1.1));
	for (let index = 0; index < fishCaught; index++) recordNpcCatch(lake, carp, swims, random, anglerName, day);
	const collectionRate = lake.has_bailiff ? FeeCollection.WithBailiff : FeeCollection.WithoutBailiff;
	const isFeePaid = random() < collectionRate;
	return { lake_id: lake.id, angler_id: null, angler_name: anglerName, fee_paid: isFeePaid ? Number(lake.day_ticket_fee) : 0, fish_caught: fishCaught };
}

function recordNpcCatch(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, anglerName: string, day: AnglerDay) {
	const fish = pickCarpThatTookTheBait(carp, random());
	if (!fish) return;
	const weightLb = Number(fish.weight_lb);
	const records = recordsBrokenBy(weightLb, day.records);
	fish.times_caught += 1;
	fish.is_catalogued = true;
	fish.fame += fameForNpcCatch(weightLb, records);
	day.records = raiseRecords(weightLb, day.records);
	day.catches.push({
		lake_id: lake.id,
		carp_id: fish.id,
		angler_id: null,
		angler_name: anglerName,
		weight_lb: weightLb,
		swim_name: swims.length > 0 ? pickRandom(random, swims).name : 'Unknown swim',
		rig: pickRandom(random, RigNames),
		bait: pickRandom(random, BaitNames),
		hook_size: pickRandom(random, HookSizes)
	});
}
