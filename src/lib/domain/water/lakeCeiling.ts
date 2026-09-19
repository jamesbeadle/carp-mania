import { featureCoverageShare, FullFeatureShare } from '../layout/featureCoverage';
import type { Lake } from '../types';
import { overallWaterQuality, WaterScale } from '../waterQuality';
import { regionGrowthCeiling } from '../world/regions';
import { feedStolenShare, type LakeSpecies } from './species';

export const Ceiling = { MouthsPerAcreThatCrowd: 60, MouthsFloor: 0.55, ConfidenceFloor: 0.65, QualityFloor: 0.8 } as const;

export type CeilingFactorName = 'mouthPressure' | 'feedingConfidence' | 'qualityFactor' | 'competitionFactor';

export interface CeilingReading {
	ceilingLb: number;
	regionCeilingLb: number;
	mouthPressure: number;
	feedingConfidence: number;
	qualityFactor: number;
	competitionFactor: number;
}

export const CeilingWords: Record<CeilingFactorName, string> = {
	mouthPressure: 'the stocking density',
	feedingConfidence: 'how little cover the water has',
	qualityFactor: 'the state of the water',
	competitionFactor: 'the other fish eating the feed'
};

type WaterForCeiling = Pick<Lake, 'acres' | 'plot_acres' | 'layout' | 'transparency' | 'weed' | 'silt' | 'region'>;

export function feedingConfidenceOf(layout: Lake['layout'], plotAcres: number) {
	const coverage = featureCoverageShare(layout, plotAcres);
	return Ceiling.ConfidenceFloor + (1 - Ceiling.ConfidenceFloor) * Math.min(1, coverage / FullFeatureShare);
}

export function lakeCeilingOf(lake: WaterForCeiling, headCount: number, species: Pick<LakeSpecies, 'species' | 'count'>[]): CeilingReading {
	const acres = Math.max(0.1, Number(lake.acres));
	const crowding = Math.min(1, headCount / acres / Ceiling.MouthsPerAcreThatCrowd);
	const mouthPressure = Ceiling.MouthsFloor + (1 - Ceiling.MouthsFloor) * (1 - crowding);
	const feedingConfidence = feedingConfidenceOf(lake.layout, Number(lake.plot_acres));
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt)) / WaterScale.Best;
	const qualityFactor = Ceiling.QualityFloor + (1 - Ceiling.QualityFloor) * quality;
	const competitionFactor = 1 - feedStolenShare(species, acres);
	const regionCeilingLb = regionGrowthCeiling(lake.region);
	const ceilingLb = Math.round(regionCeilingLb * mouthPressure * feedingConfidence * qualityFactor * competitionFactor);
	return { ceilingLb, regionCeilingLb, mouthPressure, feedingConfidence, qualityFactor, competitionFactor };
}

export function weakestCeilingFactor(reading: CeilingReading): CeilingFactorName {
	const names: CeilingFactorName[] = ['mouthPressure', 'feedingConfidence', 'qualityFactor', 'competitionFactor'];
	return names.reduce((weakest, name) => (reading[name] < reading[weakest] ? name : weakest));
}

export function ceilingWords(reading: CeilingReading) {
	return `This water will grow a fish to ${reading.ceilingLb} lb — it is ${CeilingWords[weakestCeilingFactor(reading)]} holding it down.`;
}
