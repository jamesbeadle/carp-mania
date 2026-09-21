import type { RandomFraction } from '../random';
import { stockDrawOf } from '../water/stockDraw';
import { pegsPerDayFor } from '../water/demand';
import type { Shoal } from '../stock/shoals';
import type { Carp, Lake, Swim } from '../types';
import { weatherFor } from '../world/weather';
import { ageCarpIfNewYear } from './ageing';
import { completeDueWorks } from './completeWorks';
import { driftWaterForOneDay } from './driftWater';
import { driftTeamForOneDay } from '../bailiffs/performance';
import { wagesOf } from '../bailiffs/bailiffTeam';
import { runningCostOf } from '../groundworks/facilities';
import { waterAfterDay } from './waterAfterDay';
import { feedTheLakeForOneDay } from './feedTheLake';
import { isHeatwaveToday, sufferHeatwave } from './heatwave';
import { lapseTransfersForOneDay } from './lapseTransfers';
import { driftFertilityForOneDay } from './naturalFood';
import { letPikeHuntForOneDay } from './pikePredation';
import { shoalsAfterTheDay } from './shoalsAfterTheDay';
import { simulateVisitingAnglers } from './visitingAnglers';
import type { DayContext, DayOutcome } from './dayTypes';

export type { DayContext, DayOutcome } from './dayTypes';
export { netMoneyFor } from './waterAfterDay';

const NoShoals: Shoal[] = [];

function visitingDayOf(lake: Lake, context: DayContext, carp: Carp[], shoals: Shoal[]) {
	const { season, records, book, bailiffs } = context;
	const stockDraw = stockDrawOf(carp, shoals);
	const pegsPerDay = Math.max(0, pegsPerDayFor(context.swimCount) - context.pegsBooked);
	return { season, standing: records, weather: weatherFor(lake, context.dayStart), book, shoals, bailiffs, stockDraw, pegsPerDay };
}

export function simulateOneDay(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, context: DayContext, shoals: Shoal[] = NoShoals): DayOutcome {
	const works = completeDueWorks(lake, context.works, context.dayEnd);
	const fertile = { ...works.lake, fertility: driftFertilityForOneDay(works.lake) };
	const fed = feedTheLakeForOneDay(fertile, carp, context.season.growthFactor, shoals, context.species);
	const watered = driftWaterForOneDay(fed.lake, context.bailiffs);
	const hunted = letPikeHuntForOneDay(watered, fed.carp, random, fed.shoals);
	const lapsed = lapseTransfersForOneDay(hunted.carp, context.dayEnd);
	const isHeatwave = isHeatwaveToday(hunted.lake, context.season, random);
	const shoalsToday = shoalsAfterTheDay(hunted.lake, hunted.shoals, lapsed.carp, context, isHeatwave, random);
	const today = visitingDayOf(hunted.lake, context, lapsed.carp, shoalsToday.shoals);
	const anglers = simulateVisitingAnglers(hunted.lake, lapsed.carp, swims, random, today);
	const survivors = isHeatwave ? sufferHeatwave(hunted.lake, lapsed.carp) : lapsed.carp;
	const aged = ageCarpIfNewYear(survivors, context.dayStart, context.dayEnd, random);

	return {
		lake: waterAfterDay(hunted.lake, anglers, today.stockDraw, context.species),
		carp: aged.carp,
		catches: anglers.catches,
		visits: anglers.visits,
		carpTakenByPike: hunted.carpTakenByPike,
		carpDiedOfOldAge: aged.diedOfOldAge,
		arrivedCarp: lapsed.arrived,
		carpOutOfQuarantine: lapsed.outOfQuarantine,
		feesCollected: anglers.visits.reduce((total, visit) => total + visit.fee_paid, 0),
		lodgeTakings: anglers.lodgeTakings,
		bailiffWages: wagesOf(context.bailiffs),
		aeratorRunning: runningCostOf(hunted.lake.layout.facilities),
		isHeatwave,
		records: anglers.records,
		worksCompleted: works.completed,
		shoals: shoalsToday.shoals,
		fryShoals: shoalsToday.fryShoals,
		namedFromShoals: shoalsToday.named,
		shoalFishTakenByPike: hunted.shoalFishTakenByPike,
		bailiffs: driftTeamForOneDay(context.bailiffs, random),
		turnedAway: anglers.turnedAway
	};
}

