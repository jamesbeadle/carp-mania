import { randomBetween, type RandomFraction } from '../random';
import type { NewShoal } from '../stock/shoals';
import type { Carp, Lake } from '../types';
import { canSpawn, Spawning } from './spawning';

export const FryShoal = { FewestFry: 30, MostFry: 120, SpreadLb: 1 } as const;

export function spawnFryShoal(lake: Pick<Lake, 'id' | 'weed' | 'fertility'>, carp: Carp[], random: RandomFraction): NewShoal | null {
	if (!canSpawn(lake, carp)) return null;
	const count = Math.round(randomBetween(random, FryShoal.FewestFry, FryShoal.MostFry));
	const average_weight_lb = Math.round(randomBetween(random, Spawning.FryMinimumLb, Spawning.FryMaximumLb) * 4) / 4;
	return {
		lake_id: lake.id,
		size_band: 'fry',
		count,
		average_weight_lb,
		weight_spread_lb: FryShoal.SpreadLb,
		age_years: 0,
		condition: Math.round(randomBetween(random, Spawning.FryConditionMinimum, Spawning.FryConditionMaximum)),
		origin: 'bred',
		farm_pack_id: null,
		transit_until: null,
		quarantine_until: null
	};
}
