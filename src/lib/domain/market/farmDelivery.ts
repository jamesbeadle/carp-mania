import { carpNameForIndex } from '../naming/carpNames';
import { randomBetween, type RandomFraction } from '../random';
import { pickStrain } from '../strains';
import type { CarpStrain } from '../types';
import type { RegionCode } from '../world/regionCodes';
import type { FarmPack } from './farmPacks';

export interface FarmFish {
	packId: string;
	name: string;
	strain: CarpStrain;
	weight_lb: number;
	age_years: number;
	condition: number;
}

const QuartersPerPound = 4;
const AgeSpreadYears = 1;

export function farmFishFor(pack: FarmPack, count: number, region: RegionCode, existingCount: number, random: RandomFraction): FarmFish[] {
	return Array.from({ length: count }, (_, index) => oneFarmFish(pack, region, existingCount + index, random));
}

function oneFarmFish(pack: FarmPack, region: RegionCode, nameIndex: number, random: RandomFraction): FarmFish {
	const { fromLb, toLb, ageYears } = pack.band;
	const weight_lb = roundToQuarterPound(randomBetween(random, fromLb, toLb));
	const age_years = Math.round(randomBetween(random, ageYears - AgeSpreadYears, ageYears + AgeSpreadYears));
	return {
		packId: pack.id,
		name: carpNameForIndex(nameIndex),
		strain: pickStrain(random(), region),
		weight_lb,
		age_years: Math.max(1, age_years),
		condition: Math.round(randomBetween(random, pack.conditionLowest, pack.conditionHighest))
	};
}

function roundToQuarterPound(value: number) {
	return Math.round(value * QuartersPerPound) / QuartersPerPound;
}
