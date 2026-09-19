import { Prices } from '../economy';
import { isBookedOut } from '../matches/bookings';
import type { RandomFraction } from '../random';
import { driftReputationForOneDay, clampReputation, reputationFromCatch } from '../reputation';
import type { Carp, Lake, Swim } from '../types';
import { shopTierOf } from '../tackle/shopTier';
import { overallWaterQuality } from '../waterQuality';
import { weatherFor } from '../world/weather';
import { ageCarpIfNewYear } from './ageing';
import { completeDueWorks } from './completeWorks';
import { driftWaterForOneDay, hasAerator } from './driftWater';
import { feedTheLakeForOneDay } from './feedTheLake';
import { isHeatwaveToday, sufferHeatwave } from './heatwave';
import { lapseTransfersForOneDay } from './lapseTransfers';
import { driftFertilityForOneDay } from './naturalFood';
import { letPikeHuntForOneDay } from './pikePredation';
import { isFirstDayOfSpring, spawnFry } from './spawning';
import { noAnglersToday, simulateVisitingAnglers } from './visitingAnglers';
import type { DayContext, DayOutcome } from './dayTypes';
import type { NewCatch } from './visitingAnglers';

export type { DayContext, DayOutcome } from './dayTypes';

function visitingDayOf(lake: Lake, context: DayContext) {
	return { season: context.season, standing: context.records, weather: weatherFor(lake, context.dayStart), book: context.book };
}

export function simulateOneDay(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction, context: DayContext): DayOutcome {
	const works = completeDueWorks(lake, context.works, context.dayEnd);
	const fed = feedTheLakeForOneDay({ ...works.lake, fertility: driftFertilityForOneDay(works.lake) }, carp, context.season.growthFactor);
	const watered = driftWaterForOneDay(fed.lake);
	const hunted = letPikeHuntForOneDay(watered, fed.carp, random);
	const lapsed = lapseTransfersForOneDay(hunted.carp, context.dayEnd);
	const anglers = isBookedOut(context.bookings, context.dayStart, context.dayEnd)
		? noAnglersToday(context.records)
		: simulateVisitingAnglers(hunted.lake, lapsed.carp, swims, random, visitingDayOf(hunted.lake, context));
	const isHeatwave = isHeatwaveToday(hunted.lake, context.season, random);
	const survivors = isHeatwave ? sufferHeatwave(hunted.lake, lapsed.carp) : lapsed.carp;
	const aged = ageCarpIfNewYear(survivors, context.dayStart, context.dayEnd, random);
	const spawned = isFirstDayOfSpring(context.dayStart, context.dayEnd, hunted.lake.latitude) ? spawnFry(hunted.lake, aged.carp, random) : [];

	return {
		lake: waterAfterDay(hunted.lake, anglers.catches),
		carp: aged.carp,
		catches: anglers.catches,
		visits: anglers.visits,
		carpTakenByPike: hunted.carpTakenByPike,
		carpDiedOfOldAge: aged.diedOfOldAge,
		arrivedCarp: lapsed.arrived,
		carpOutOfQuarantine: lapsed.outOfQuarantine,
		feesCollected: anglers.visits.reduce((total, visit) => total + visit.fee_paid, 0),
		lodgeTakings: anglers.lodgeTakings,
		bailiffWages: hunted.lake.has_bailiff ? Prices.BailiffDailyWage : 0,
		aeratorRunning: hasAerator(hunted.lake) ? Prices.AeratorDailyRunning : 0,
		isHeatwave,
		records: anglers.records,
		worksCompleted: works.completed,
		spawned
	};
}

export function netMoneyFor(day: Pick<DayOutcome, 'feesCollected' | 'lodgeTakings' | 'bailiffWages' | 'aeratorRunning'>) {
	return day.feesCollected + day.lodgeTakings - day.bailiffWages - day.aeratorRunning;
}

function waterAfterDay(lake: Lake, catches: NewCatch[]): Lake {
	return { ...lake, reputation: reputationAfterDay(lake, catches), shop_tier: shopTierOf(lake) };
}

function reputationAfterDay(lake: Lake, catches: NewCatch[]) {
	const gained = catches.reduce((total, caught) => total + reputationFromCatch(caught.weight_lb, Number(lake.reputation)), 0);
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt));
	return driftReputationForOneDay(clampReputation(Number(lake.reputation) + gained), quality);
}
