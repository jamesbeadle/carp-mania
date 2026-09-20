import { WaterScale } from '../waterQuality';

export const SpotSpread = { Weight: 1.8, AverageSpotBiteFactor: 1, Lowest: 0.25 } as const;

export function spotSpreadFactor(difficulty: number, spotBiteFactor: number) {
	const hardness = 1 - difficulty / WaterScale.Best;
	const spread = 1 + hardness * (spotBiteFactor - SpotSpread.AverageSpotBiteFactor) * SpotSpread.Weight;
	return Math.max(SpotSpread.Lowest, spread);
}
