import { FacilityEffects, FeeCollection } from '../economy';
import { fameForNpcCatch } from '../market/fame';
import { raiseRecords, recordsBrokenBy, type StandingRecords } from '../market/records';
import { conditionsShareFor } from '../fishing/weatherConditions';
import type { TicketProduct } from '../fishing/ticketBook';
import { randomAnglerName } from '../naming/anglerNames';
import { pickRandom, randomBetween, type RandomFraction } from '../random';
import { typicalAnglerSkillFor } from '../reputation';
import { BaitNames } from '../tackle/baits';
import { HookSizes } from '../tackle/hooks';
import { RigNames } from '../tackle/rigs';
import type { Carp, Catch, Lake, LakeVisit, Swim } from '../types';
import { lakeConfidenceFactor } from '../fishing/biteChance';
import type { Season } from '../world/seasons';
import type { Weather } from '../world/weather';
import { isFishable } from './lapseTransfers';
import { anglersArrivingToday } from './anglerDemand';
import { chooseTicket, feeFor, willingnessToPayFor } from './ticketChoice';
import { carpTakenByVisitor } from './visitorTake';

export { anglersArrivingToday } from './anglerDemand';
export { willingnessToPayFor } from './ticketChoice';

const GoodAnglerCatchesPerDay = 19;
const HoursInADay = 24;

export type NewCatch = Omit<Catch, 'id' | 'caught_at' | 'owner_name'>;
export type NewVisit = Omit<LakeVisit, 'id' | 'visited_at'>;

export interface AnglerDay {
	visits: NewVisit[];
	catches: NewCatch[];
	records: StandingRecords;
	lodgeTakings: number;
}

export interface VisitingDay {
	season: Season;
	standing: StandingRecords;
	weather: Weather;
	book: TicketProduct[];
}

export function noAnglersToday(standing: StandingRecords): AnglerDay {
	return { visits: [], catches: [], records: standing, lodgeTakings: 0 };
}

export function simulateVisitingAnglers(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, today: VisitingDay): AnglerDay {
	const day: AnglerDay = { visits: [], catches: [], records: today.standing, lodgeTakings: 0 };
	const count = anglersArrivingToday(lake, today.season, today.book);
	const fishable = carp.filter(isFishable);
	for (let index = 0; index < count; index++) day.visits.push(simulateOneAngler(lake, fishable, swims, random, today, day));
	day.lodgeTakings = lake.layout.facilities.includes('lodge') ? count * FacilityEffects.LodgeTakingsPerAngler : 0;
	return day;
}

function simulateOneAngler(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, today: VisitingDay, day: AnglerDay): NewVisit {
	const anglerName = randomAnglerName(random(), random());
	const rating = Math.min(100, Math.max(5, typicalAnglerSkillFor(Number(lake.reputation)) + randomBetween(random, -20, 20)));
	const fishCaught = Math.round(GoodAnglerCatchesPerDay * (rating / 100) * lakeConfidenceFactor(lake) * today.season.biteFactor * randomBetween(random, 0.4, 1.1));
	for (let index = 0; index < fishCaught; index++) recordNpcCatch(lake, carp, swims, random, anglerName, rating, today, day);
	const collectionRate = lake.has_bailiff ? FeeCollection.WithBailiff : FeeCollection.WithoutBailiff;
	const isFeePaid = random() < collectionRate;
	const ticket = chooseTicket(today.book, willingnessToPayFor(Number(lake.reputation), lake.region), random);
	const fee = feeFor(ticket, Number(lake.day_ticket_fee));
	return { lake_id: lake.id, angler_id: null, angler_name: anglerName, fee_paid: isFeePaid ? fee : 0, fish_caught: fishCaught };
}

function recordNpcCatch(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, anglerName: string, rating: number, today: VisitingDay, day: AnglerDay) {
	const hour = random() * HoursInADay;
	const fish = carpTakenByVisitor(lake, carp, rating, hour, conditionsShareFor(hour, today.weather), random);
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
