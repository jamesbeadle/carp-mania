import { totalFeedKilograms } from '../feed';
import type { Lake } from '../types';
import { overallWaterQuality, WaterScale } from '../waterQuality';
import { timeOfDayBiteFactor } from './sessionClock';

const BaseBitesPerRodHour = 0.5;
const SkillFloor = 0.35;
const MaximumChancePerHour = 0.9;

export interface BiteConditions {
	spotFactor: number;
	seasonFactor: number;
}

export const NeutralBiteConditions: BiteConditions = { spotFactor: 1, seasonFactor: 1 };

export function lakeHungerFactor(lake: Pick<Lake, 'feed_stock' | 'acres'>) {
	const kilogramsPerAcre = totalFeedKilograms(lake.feed_stock) / Math.max(0.1, Number(lake.acres));
	const isHeavilyFed = kilogramsPerAcre > 8;
	return isHeavilyFed ? 0.85 : 1.15 - Math.min(0.3, kilogramsPerAcre * 0.04);
}

export function lakeConfidenceFactor(lake: Pick<Lake, 'transparency' | 'weed' | 'silt' | 'disturbance'>) {
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt) + Number(lake.disturbance ?? 0));
	return 0.5 + quality / (WaterScale.Best * 2);
}

export function skillFactor(overallSkill: number) {
	return SkillFloor + (overallSkill / 100) * (1 - SkillFloor);
}

export function biteChanceForOneHour(lake: Lake, tackleMatchOverall: number, overallSkill: number, hour: number, conditions: BiteConditions = NeutralBiteConditions) {
	const chance =
		BaseBitesPerRodHour *
		lakeHungerFactor(lake) *
		lakeConfidenceFactor(lake) *
		tackleMatchOverall *
		skillFactor(overallSkill) *
		timeOfDayBiteFactor(hour) *
		conditions.spotFactor *
		conditions.seasonFactor;
	return Math.min(MaximumChancePerHour, chance);
}
