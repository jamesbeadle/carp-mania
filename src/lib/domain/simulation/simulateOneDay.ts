import { Prices } from '../economy';
import type { RandomFraction } from '../random';
import { driftReputationForOneDay, clampReputation, reputationFromCatch } from '../reputation';
import type { Carp, Lake, Swim } from '../types';
import { overallWaterQuality } from '../waterQuality';
import { driftWaterForOneDay } from './driftWater';
import { feedTheLakeForOneDay } from './feedTheLake';
import { letPikeHuntForOneDay } from './pikePredation';
import { simulateVisitingAnglers, type NewCatch, type NewVisit } from './visitingAnglers';

export interface DayOutcome {
	lake: Lake;
	carp: Carp[];
	catches: NewCatch[];
	visits: NewVisit[];
	carpTakenByPike: Carp[];
	feesCollected: number;
	bailiffWages: number;
}

export function simulateOneDay(lake: Lake, carp: Carp[], swims: Swim[], random: RandomFraction): DayOutcome {
	const fed = feedTheLakeForOneDay(lake, carp);
	const watered = driftWaterForOneDay(fed.lake);
	const hunted = letPikeHuntForOneDay(watered, fed.carp, random);
	const anglers = simulateVisitingAnglers(hunted.lake, hunted.carp, swims, random);

	const feesCollected = anglers.visits.reduce((total, visit) => total + visit.fee_paid, 0);
	const bailiffWages = hunted.lake.has_bailiff ? Prices.BailiffDailyWage : 0;
	const reputation = reputationAfterDay(hunted.lake, anglers.catches);

	return {
		lake: { ...hunted.lake, reputation },
		carp: hunted.carp,
		catches: anglers.catches,
		visits: anglers.visits,
		carpTakenByPike: hunted.carpTakenByPike,
		feesCollected,
		bailiffWages
	};
}

function reputationAfterDay(lake: Lake, catches: NewCatch[]) {
	const gained = catches.reduce((total, caught) => total + reputationFromCatch(caught.weight_lb, lake.reputation), 0);
	const quality = overallWaterQuality(lake.transparency, lake.weed, lake.silt);
	return driftReputationForOneDay(clampReputation(lake.reputation + gained), quality);
}
