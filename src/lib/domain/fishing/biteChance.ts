import { totalFeedKilograms } from '../feed';
import type { Lake } from '../types';
import { overallWaterQuality, WaterScale } from '../waterQuality';
import { timeOfDayBiteFactor } from './sessionClock';

const BaseBitesPerRodHour = 0.5;
const SkillFloor = 0.35;

export function lakeHungerFactor(lake: Lake) {
	const kilogramsPerAcre = totalFeedKilograms(lake.feed_stock) / lake.acres;
	const isHeavilyFed = kilogramsPerAcre > 8;
	return isHeavilyFed ? 0.85 : 1.15 - Math.min(0.3, kilogramsPerAcre * 0.04);
}

export function lakeConfidenceFactor(lake: Lake) {
	const quality = overallWaterQuality(lake.transparency, lake.weed, lake.silt);
	return 0.5 + quality / (WaterScale.Best * 2);
}

export function skillFactor(overallSkill: number) {
	return SkillFloor + (overallSkill / 100) * (1 - SkillFloor);
}

export function biteChanceForOneHour(lake: Lake, tackleMatchOverall: number, overallSkill: number, hour: number) {
	const chance =
		BaseBitesPerRodHour *
		lakeHungerFactor(lake) *
		lakeConfidenceFactor(lake) *
		tackleMatchOverall *
		skillFactor(overallSkill) *
		timeOfDayBiteFactor(hour);
	return Math.min(0.9, chance);
}
