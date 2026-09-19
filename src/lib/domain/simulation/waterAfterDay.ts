import { reputationPerDayOf } from '../groundworks/facilities';
import { clampReputation, reputationFromCatch } from '../reputation';
import { shopTierOf } from '../tackle/shopTier';
import type { Lake } from '../types';
import { driftReputationTowardsRenown } from '../water/renown';
import type { LakeSpecies } from '../water/species';
import { overallWaterQuality } from '../waterQuality';
import type { DayOutcome } from './dayTypes';
import type { AnglerDay } from './visitingAnglers';

export function netMoneyFor(day: Pick<DayOutcome, 'feesCollected' | 'lodgeTakings' | 'bailiffWages' | 'aeratorRunning'>) {
	return day.feesCollected + day.lodgeTakings - day.bailiffWages - day.aeratorRunning;
}

export function waterAfterDay(lake: Lake, anglers: AnglerDay, stockDraw: number, species: LakeSpecies[]): Lake {
	return { ...lake, reputation: reputationAfterDay(lake, anglers, stockDraw, species), shop_tier: shopTierOf(lake) };
}

function reputationAfterDay(lake: Lake, anglers: AnglerDay, stockDraw: number, species: LakeSpecies[]) {
	const reputation = Number(lake.reputation);
	const fromFacilities = reputationPerDayOf(lake.layout.facilities);
	const gained = anglers.catches.reduce((total, caught) => total + reputationFromCatch(caught.weight_lb, reputation), fromFacilities);
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt));
	const settled = clampReputation(reputation + gained);
	return driftReputationTowardsRenown(settled, quality, { stockDraw, turnedAway: anglers.turnedAway, species });
}
