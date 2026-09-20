import { carpNameForIndex } from '../naming/carpNames';
import type { RandomFraction } from '../random';
import { pickStrain } from '../strains';
import type { Carp } from '../types';
import type { RegionCode } from '../world/regionCodes';
import { ShoalRules, type Shoal } from './shoals';

export type NewNamedFish = Omit<Carp, 'id'>;

const QuartersPerPound = 4;
const TopOfTheShoalShare = 0.1;
const FewestNamedOffTheTop = 1;

export function drawFishFromShoal(shoal: Shoal, roll: number, nameIndex: number, region: RegionCode): NewNamedFish {
	const spread = Number(shoal.weight_spread_lb);
	const weight_lb = roundToQuarterPound(Number(shoal.average_weight_lb) + (roll * 2 - 1) * spread);
	return {
		lake_id: shoal.lake_id,
		name: carpNameForIndex(nameIndex),
		strain: pickStrain(roll, region),
		weight_lb: Math.max(1, weight_lb),
		age_years: shoal.age_years,
		condition: Number(shoal.condition),
		times_caught: 0,
		origin: shoal.origin,
		origin_lake_id: shoal.origin === 'bred' ? shoal.lake_id : null,
		fame: 0,
		is_catalogued: true,
		transit_until: null,
		quarantine_until: null
	};
}

export function namedOffTheTop(shoal: Shoal, random: RandomFraction, firstNameIndex: number, region: RegionCode) {
	const named = Math.max(FewestNamedOffTheTop, Math.round(shoal.count * TopOfTheShoalShare));
	const fish = Array.from({ length: Math.min(named, shoal.count) }, (_, index) => topFish(shoal, random(), firstNameIndex + index, region));
	return { fish, shoal: { ...shoal, count: shoal.count - fish.length } };
}

function topFish(shoal: Shoal, roll: number, nameIndex: number, region: RegionCode): NewNamedFish {
	const drawn = drawFishFromShoal(shoal, roll, nameIndex, region);
	const topWeight = Number(shoal.average_weight_lb) + Number(shoal.weight_spread_lb) * roll;
	return { ...drawn, weight_lb: Math.max(ShoalRules.NamedFromLb, roundToQuarterPound(topWeight)), is_catalogued: false };
}

function roundToQuarterPound(value: number) {
	return Math.round(value * QuartersPerPound) / QuartersPerPound;
}
