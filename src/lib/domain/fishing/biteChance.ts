import { totalFeedKilograms } from '../feed';
import { clampFraction, fractionOfHundred } from '../fraction';
import type { Lake } from '../types';
import { overallWaterQuality, WaterScale } from '../waterQuality';
import { timeOfDayBiteFactor } from './sessionClock';

export const BaseBitesPerRodHour = 0.17;
export const CountPull = { Floor: 0.85, CraftSwing: 0.15, TackleSwing: 0.3 } as const;
const MaximumChancePerHour = 0.9;
const SmallestAcres = 0.1;
const ConfidenceFloor = 0.5;
const Feeding = {
	HeavyAboveKilogramsPerAcre: 8,
	HeavilyFedFactor: 0.85,
	HungryFactor: 1.15,
	MostFullness: 0.3,
	FullnessPerKilogram: 0.04
} as const;

export interface BiteConditions {
	spotFactor: number;
	seasonFactor: number;
}

export const NeutralBiteConditions: BiteConditions = { spotFactor: 1, seasonFactor: 1 };

export function lakeHungerFactor(lake: Pick<Lake, 'feed_stock' | 'acres'>) {
	const acres = Math.max(SmallestAcres, Number(lake.acres));
	const kilogramsPerAcre = totalFeedKilograms(lake.feed_stock) / acres;
	const isHeavilyFed = kilogramsPerAcre > Feeding.HeavyAboveKilogramsPerAcre;
	if (isHeavilyFed) return Feeding.HeavilyFedFactor;
	const fullness = Math.min(Feeding.MostFullness, kilogramsPerAcre * Feeding.FullnessPerKilogram);
	return Feeding.HungryFactor - fullness;
}

export function lakeConfidenceFactor(lake: Pick<Lake, 'transparency' | 'weed' | 'silt' | 'disturbance'>) {
	const cloudiness = Number(lake.silt) + Number(lake.disturbance ?? 0);
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), cloudiness);
	return ConfidenceFloor + quality / (WaterScale.Best * 2);
}

export function craftCountFactor(rating: number) {
	return CountPull.Floor + CountPull.CraftSwing * fractionOfHundred(rating);
}

export function tackleCountFactor(tackleMatchOverall: number) {
	return CountPull.Floor + CountPull.TackleSwing * clampFraction(tackleMatchOverall);
}

export function biteChanceForOneHour(lake: Lake, tackleMatchOverall: number, rating: number, hour: number, conditions: BiteConditions = NeutralBiteConditions) {
	const chance =
		BaseBitesPerRodHour *
		lakeHungerFactor(lake) *
		lakeConfidenceFactor(lake) *
		tackleCountFactor(tackleMatchOverall) *
		craftCountFactor(rating) *
		timeOfDayBiteFactor(hour) *
		conditions.spotFactor *
		conditions.seasonFactor;
	return Math.min(MaximumChancePerHour, chance);
}
