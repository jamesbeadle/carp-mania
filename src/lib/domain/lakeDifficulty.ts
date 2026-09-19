import { featureCoverageShare, FullFeatureShare } from './layout/featureCoverage';
import type { Lake } from './types';
import { overallWaterQuality, WaterScale } from './waterQuality';

export const Difficulty = {
	SpreadFromAcres: 10,
	SpreadPerAcre: 1 / 400,
	MostSpread: 0.55,
	StockingFloor: 0.55,
	FishPerAcreForEasy: 120,
	FeatureFloor: 0.7,
	QualityFloor: 0.75,
	HardBelow: 35,
	EasyFrom: 65
} as const;

export interface DifficultyReading {
	difficulty: number;
	sizeSpread: number;
	stockingFactor: number;
	featureFactor: number;
	qualityFactor: number;
}

type WaterForDifficulty = Pick<Lake, 'acres' | 'plot_acres' | 'layout' | 'transparency' | 'weed' | 'silt'>;

export function lakeDifficultyOf(lake: WaterForDifficulty, headCount: number): DifficultyReading {
	const acres = Math.max(0.1, Number(lake.acres));
	const acresBeyondSmall = Math.max(0, acres - Difficulty.SpreadFromAcres);
	const sizeSpread = 1 - Math.min(Difficulty.MostSpread, acresBeyondSmall * Difficulty.SpreadPerAcre);
	const stockingShare = Math.min(1, headCount / acres / Difficulty.FishPerAcreForEasy);
	const stockingFactor = Difficulty.StockingFloor + (1 - Difficulty.StockingFloor) * stockingShare;
	const coverage = featureCoverageShare(lake.layout, Number(lake.plot_acres));
	const featureFactor = Difficulty.FeatureFloor + (1 - Difficulty.FeatureFloor) * Math.min(1, coverage / FullFeatureShare);
	const waterQuality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt));
	const quality = waterQuality / WaterScale.Best;
	const qualityFactor = Difficulty.QualityFloor + (1 - Difficulty.QualityFloor) * quality;
	const difficulty = Math.round(WaterScale.Best * sizeSpread * stockingFactor * featureFactor * qualityFactor);
	return { difficulty, sizeSpread, stockingFactor, featureFactor, qualityFactor };
}

export function difficultyWord(difficulty: number) {
	if (difficulty < Difficulty.HardBelow) return 'hard';
	if (difficulty >= Difficulty.EasyFrom) return 'easy';
	return 'fair';
}

export function whatWouldEaseIt(reading: DifficultyReading) {
	const levers = [
		{ name: 'stock', factor: reading.stockingFactor, words: 'stock it heavier — fish an acre is what makes a water forgiving' },
		{ name: 'features', factor: reading.featureFactor, words: 'build features — bars, islands, reeds and snags give the fish somewhere to be' },
		{ name: 'quality', factor: reading.qualityFactor, words: 'clear the water — a bailiff, dredging and reeds' }
	];
	return levers.reduce((weakest, lever) => (lever.factor < weakest.factor ? lever : weakest)).words;
}
