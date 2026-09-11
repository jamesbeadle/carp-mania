import { carpNameForIndex } from '../naming/carpNames';
import { pickRandom, randomBetween, type RandomFraction } from '../random';
import type { Carp, Lake } from '../types';
import { dayOfFisheryYear, hemisphereOf, seasonNameFor } from '../world/worldClock';
import { effectiveFertility } from './naturalFood';

export const Spawning = {
	MinimumWeed: 25,
	MinimumFertility: 50,
	MinimumAdults: 10,
	AdultFromLb: 8,
	FewestFry: 3,
	MostFry: 8,
	FryMinimumLb: 2,
	FryMaximumLb: 4,
	FryConditionMinimum: 70,
	FryConditionMaximum: 85
} as const;

export type NewBornCarp = Omit<Carp, 'id'>;

export function isFirstDayOfSpring(dayStart: Date, dayEnd: Date, latitude: number | null) {
	const hemisphere = hemisphereOf(latitude);
	return seasonNameFor(dayOfFisheryYear(dayStart), hemisphere) !== 'spring' && seasonNameFor(dayOfFisheryYear(dayEnd), hemisphere) === 'spring';
}

export function canSpawn(lake: Pick<Lake, 'weed' | 'fertility'>, carp: Carp[]) {
	const adults = carp.filter((fish) => fish.is_catalogued && Number(fish.weight_lb) >= Spawning.AdultFromLb);
	return Number(lake.weed) >= Spawning.MinimumWeed && effectiveFertility(lake) >= Spawning.MinimumFertility && adults.length >= Spawning.MinimumAdults;
}

export function spawnFry(lake: Pick<Lake, 'id' | 'weed' | 'fertility'>, carp: Carp[], random: RandomFraction): NewBornCarp[] {
	if (!canSpawn(lake, carp)) return [];
	const parents = carp.filter((fish) => Number(fish.weight_lb) >= Spawning.AdultFromLb);
	const fryCount = Math.round(randomBetween(random, Spawning.FewestFry, Spawning.MostFry));
	return Array.from({ length: fryCount }, (_, index) => ({
		lake_id: lake.id,
		name: carpNameForIndex(carp.length + index),
		strain: pickRandom(random, parents).strain,
		weight_lb: Math.round(randomBetween(random, Spawning.FryMinimumLb, Spawning.FryMaximumLb) * 4) / 4,
		age_years: 0,
		condition: Math.round(randomBetween(random, Spawning.FryConditionMinimum, Spawning.FryConditionMaximum)),
		times_caught: 0,
		origin: 'bred',
		origin_lake_id: lake.id,
		fame: 0,
		is_catalogued: false,
		transit_until: null,
		quarantine_until: null
	}));
}
