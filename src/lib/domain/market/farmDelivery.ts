import { carpNameForIndex } from '../naming/carpNames';
import { randomBetween, type RandomFraction } from '../random';
import { pickStrain } from '../strains';
import type { CarpStrain } from '../types';
import type { RegionCode } from '../world/regionCodes';
import { shoalBandOf, ShoalRules, type NewShoal } from '../stock/shoals';
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

export function farmShoalFor(pack: FarmPack, count: number, lakeId: string): NewShoal {
	const { fromLb, toLb, ageYears } = pack.band;
	const average_weight_lb = roundToQuarterPound((fromLb + toLb) / 2);
	return {
		lake_id: lakeId,
		size_band: shoalBandOf(average_weight_lb),
		count,
		average_weight_lb,
		weight_spread_lb: roundToQuarterPound((toLb - fromLb) / 2),
		age_years: ageYears,
		condition: Math.round((pack.conditionLowest + pack.conditionHighest) / 2),
		origin: 'farm',
		farm_pack_id: pack.id,
		transit_until: null,
		quarantine_until: null
	};
}

export function arrivesAsAShoal(pack: Pick<FarmPack, 'band'>, count: number) {
	const isTooManyToName = count > ShoalRules.NamedFishThreshold;
	return isTooManyToName || pack.band.toLb < ShoalRules.NamedFromLb;
}
