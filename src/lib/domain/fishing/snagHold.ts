import type { Terrain } from '../layout/terrainAt';
import type { Carp } from '../types';
import type { SpotBonus } from './takeWeight';

export const SnagHold = { BiteShareOfOpenWater: 0.4, ReferenceLb: 20, SmallestCountedLb: 8, SizePull: 2 } as const;

const NoHold = 1;

export function isASnag(terrain: Pick<Terrain, 'feature'>) {
	return terrain.feature === 'snag';
}

export function snagBiteShareFactor(terrain: Pick<Terrain, 'feature'>) {
	return isASnag(terrain) ? SnagHold.BiteShareOfOpenWater : NoHold;
}

export function snagHoldOf(carp: Pick<Carp, 'weight_lb'>) {
	const counted = Math.max(Number(carp.weight_lb), SnagHold.SmallestCountedLb) / SnagHold.ReferenceLb;
	return Math.pow(counted, SnagHold.SizePull);
}

export function snagHoldFor(terrain: Pick<Terrain, 'feature'>): SpotBonus {
	if (!isASnag(terrain)) return () => NoHold;
	return snagHoldOf;
}

export function combinedSpotBonus(...bonuses: SpotBonus[]): SpotBonus {
	return (carp) => bonuses.reduce((product, bonus) => product * bonus(carp), NoHold);
}
