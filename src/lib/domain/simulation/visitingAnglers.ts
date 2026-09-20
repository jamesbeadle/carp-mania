import { feeCollectionOf, type Bailiff } from '../bailiffs/bailiffTeam';
import { takingsPerAnglerOf } from '../groundworks/facilities';
import { ShopSpendPerAngler } from '../tackle/shopTier';
import type { StandingRecords } from '../market/records';
import type { TicketProduct } from '../fishing/ticketBook';
import { randomAnglerName } from '../naming/anglerNames';
import { randomBetween, type RandomFraction } from '../random';
import { typicalAnglerSkillFor } from '../reputation';
import type { Carp, Catch, Lake, LakeVisit, Swim } from '../types';
import { lakeConfidenceFactor } from '../fishing/biteChance';
import type { Season } from '../world/seasons';
import type { Weather } from '../world/weather';
import { isFishable } from './lapseTransfers';
import { recordNpcCatch } from './npcCatch';
import { anglersArrivingToday, willingnessAt } from './anglerDemand';
import { prizeAnglerBonus } from '../water/stockDraw';
import { chooseTicket, feeFor, willingnessToPayFor } from './ticketChoice';
import type { Shoal } from '../stock/shoals';

export { anglersArrivingToday } from './anglerDemand';
export { willingnessToPayFor } from './ticketChoice';

const GoodAnglerCatchesPerDay = 19;

export type NewCatch = Omit<Catch, 'id' | 'caught_at' | 'owner_name'>;
export type NewVisit = Omit<LakeVisit, 'id' | 'visited_at'>;

export interface VisitingDay {
	season: Season;
	standing: StandingRecords;
	weather: Weather;
	book: TicketProduct[];
	shoals: Shoal[];
	bailiffs: Bailiff[];
	stockDraw: number;
	pegsPerDay: number;
}

export interface AnglerDay {
	visits: NewVisit[];
	catches: NewCatch[];
	records: StandingRecords;
	lodgeTakings: number;
	turnedAway: number;
}

export function noAnglersToday(standing: StandingRecords): AnglerDay {
	return { visits: [], catches: [], records: standing, lodgeTakings: 0, turnedAway: 0 };
}

export function simulateVisitingAnglers(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, today: VisitingDay): AnglerDay {
	const wanting = anglersArrivingToday(lake, today.season, today.book, today.stockDraw);
	const count = Math.min(wanting, Math.round(today.pegsPerDay));
	const day: AnglerDay = { visits: [], catches: [], records: today.standing, lodgeTakings: 0, turnedAway: wanting - count };
	const fishable = carp.filter(isFishable);
	for (let index = 0; index < count; index++) day.visits.push(simulateOneAngler(lake, fishable, swims, random, today, day));
	day.lodgeTakings = count * takingsPerHeadAt(lake);
	return day;
}

function simulateOneAngler(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, today: VisitingDay, day: AnglerDay): NewVisit {
	const anglerName = randomAnglerName(random(), random());
	const typical = typicalAnglerSkillFor(Number(lake.reputation)) + prizeAnglerBonus(today.stockDraw);
	const rating = Math.min(100, Math.max(5, typical + randomBetween(random, -20, 20)));
	const goodDay = GoodAnglerCatchesPerDay * (rating / 100) * lakeConfidenceFactor(lake) * today.season.biteFactor;
	const fishCaught = Math.round(goodDay * randomBetween(random, 0.4, 1.1));
	for (let index = 0; index < fishCaught; index++) recordNpcCatch(lake, carp, swims, random, anglerName, rating, today, day);
	const isFeePaid = random() < feeCollectionOf(today.bailiffs);
	const ticket = chooseTicket(today.book, willingnessAt(lake, today.stockDraw), random);
	const fee = feeFor(ticket, Number(lake.day_ticket_fee));
	return { lake_id: lake.id, angler_id: null, angler_name: anglerName, fee_paid: isFeePaid ? fee : 0, fish_caught: fishCaught };
}

function takingsPerHeadAt(lake: Lake) {
	const facilities = lake.layout.facilities;
	const shop = facilities.includes('tackle_shop') ? ShopSpendPerAngler[lake.shop_tier] : 0;
	return takingsPerAnglerOf(facilities) + shop;
}
