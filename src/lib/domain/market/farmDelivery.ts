import { carpNameForIndex } from '../naming/carpNames';
import { randomBetween, type RandomFraction } from '../random';
import { pickStrain } from '../strains';
import type { CarpStrain } from '../types';
import type { RegionCode } from '../world/regionCodes';
import { ageForFarmFish, FarmBands, FarmFishCondition, type FarmBand, type FarmBandKey, type FarmOrder } from './fishFarm';

export interface FarmFish {
	band: FarmBandKey;
	name: string;
	strain: CarpStrain;
	weight_lb: number;
	age_years: number;
	condition: number;
}

const QuartersPerPound = 4;

export function farmFishFor(order: FarmOrder, region: RegionCode | null, existingCount: number, random: RandomFraction): FarmFish[] {
	const delivery: FarmFish[] = [];
	for (const band of FarmBands) {
		const count = order[band.key] ?? 0;
		for (let index = 0; index < count; index++) delivery.push(oneFarmFish(band, region, existingCount + delivery.length, random));
	}
	return delivery;
}

function oneFarmFish(band: FarmBand, region: RegionCode | null, nameIndex: number, random: RandomFraction): FarmFish {
	const weight_lb = roundToQuarterPound(randomBetween(random, band.minimumLb, band.maximumLb));
	return {
		band: band.key,
		name: carpNameForIndex(nameIndex),
		strain: pickStrain(random(), region),
		weight_lb,
		age_years: ageForFarmFish(weight_lb),
		condition: Math.round(randomBetween(random, FarmFishCondition.Minimum, FarmFishCondition.Maximum))
	};
}

function roundToQuarterPound(value: number) {
	return Math.round(value * QuartersPerPound) / QuartersPerPound;
}
