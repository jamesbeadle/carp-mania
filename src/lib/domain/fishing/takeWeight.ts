import type { Carp } from '../types';
import { feedingWindowFit } from './feedingWindow';
import { noKitFactor, type KitFactor } from './kitAgeFactor';

export const SizeBias = { AtNoReach: -1.5, AtFullReach: 1.5, SmallestCountedLb: 8, TwentyLb: 20 } as const;
export const Appetite = { Floor: 0.5, PerConditionPoint: 1 / 200 } as const;

export type SpotBonus = (carp: Carp) => number;

export interface Take {
	sizeReach: number;
	hour: number;
	spotBonusFor: SpotBonus;
	kitFactorFor?: KitFactor;
}

export function noSpotBonus() {
	return 1;
}

export function biasExponentFor(sizeReach: number) {
	return SizeBias.AtNoReach + (SizeBias.AtFullReach - SizeBias.AtNoReach) * sizeReach;
}

export function sizeBiasOf(weightLb: number, sizeReach: number) {
	const counted = Math.max(weightLb, SizeBias.SmallestCountedLb) / SizeBias.TwentyLb;
	return Math.pow(counted, biasExponentFor(sizeReach));
}

export function appetiteOf(carp: Pick<Carp, 'condition'>) {
	return Appetite.Floor + Number(carp.condition) * Appetite.PerConditionPoint;
}

export function takeWeightOf(carp: Carp, take: Take) {
	const sizeBias = sizeBiasOf(Number(carp.weight_lb), take.sizeReach);
	const windowFit = feedingWindowFit(carp, take.hour);
	const kitFactor = (take.kitFactorFor ?? noKitFactor)(carp);
	return appetiteOf(carp) * sizeBias * windowFit * take.spotBonusFor(carp) * kitFactor;
}

export function takeWeightsFor(carp: Carp[], take: Take) {
	return carp.map((fish) => takeWeightOf(fish, take));
}
