import { clampFraction, fractionOfHundred } from '../fraction';
import { featuresPresent } from '../layout/favouriteFeature';
import type { Lake } from '../types';
import { overallWaterQuality, WaterScale } from '../waterQuality';

export const SizeReachWeights = {
	Rating: 0.35,
	Tackle: 0.25,
	Conditions: 0.2,
	Water: 0.2
} as const;
export const WaterShareWeights = { Features: 0.4, Quality: 0.3, Mouths: 0.3 } as const;
export const MouthsPerAcreThatCrowd = 60;
export const FeatureKindsForFullShare = 4;
const ReachBands = { DoublesBelow: 0.4, TwentiesBelow: 0.7 } as const;

export type ShareName = 'ratingShare' | 'tackleShare' | 'conditionsShare' | 'waterShare';

export interface SizeReachShares {
	ratingShare: number;
	tackleShare: number;
	conditionsShare: number;
	waterShare: number;
}

export const ShareWords: Record<ShareName, string> = {
	ratingShare: 'your rating',
	tackleShare: 'your tackle',
	conditionsShare: 'the hour and the weather',
	waterShare: 'the water'
};

export function sizeReachOf(shares: SizeReachShares) {
	const reach =
		SizeReachWeights.Rating * shares.ratingShare +
		SizeReachWeights.Tackle * shares.tackleShare +
		SizeReachWeights.Conditions * shares.conditionsShare +
		SizeReachWeights.Water * shares.waterShare;
	return clampFraction(reach);
}

export function weakestShareOf(shares: SizeReachShares): ShareName {
	const names: ShareName[] = ['ratingShare', 'tackleShare', 'conditionsShare', 'waterShare'];
	return names.reduce((weakest, name) => (shares[name] < shares[weakest] ? name : weakest));
}

export function ratingShareOf(rating: number) {
	return fractionOfHundred(rating);
}

export type WaterForReach = Pick<Lake, 'layout' | 'acres' | 'transparency' | 'weed' | 'silt' | 'disturbance'>;

export function waterShareOf(lake: WaterForReach, fishCount: number) {
	const featureShare = Math.min(1, (featuresPresent(lake.layout).length - 1) / FeatureKindsForFullShare);
	const cloudiness = Number(lake.silt) + Number(lake.disturbance ?? 0);
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), cloudiness) / WaterScale.Best;
	const fishPerAcre = fishCount / Math.max(0.1, Number(lake.acres));
	const mouthShare = 1 - Math.min(1, fishPerAcre / MouthsPerAcreThatCrowd);
	return clampFraction(WaterShareWeights.Features * featureShare + WaterShareWeights.Quality * quality + WaterShareWeights.Mouths * mouthShare);
}

export function sizeReachWords(reach: number, shares: SizeReachShares) {
	const percent = Math.round(reach * 100);
	return `Size reach ${percent} — you are fishing for ${targetWordsFor(reach)}. ${capitalise(ShareWords[weakestShareOf(shares)])} is what is holding it down.`;
}

function targetWordsFor(reach: number) {
	if (reach < ReachBands.DoublesBelow) return 'the doubles';
	if (reach < ReachBands.TwentiesBelow) return 'the twenties';
	return 'the big fish';
}

function capitalise(words: string) {
	return words.charAt(0).toUpperCase() + words.slice(1);
}

