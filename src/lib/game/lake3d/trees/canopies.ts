import type { TreeKind } from './plantedTree';

export interface Canopy {
	centre: number;
	radius: number;
	stretch: number;
	lobes: number;
	cards: number;
	cardSize: number;
	droop: number;
	trunkHeight: number;
	trunkRadius: number;
	limbs: number;
}

export const Canopies: Record<TreeKind, Canopy> = {
	poplar: { centre: 0.58, radius: 0.15, stretch: 2.7, lobes: 5, cards: 130, cardSize: 0.17, droop: 0, trunkHeight: 0.3, trunkRadius: 0.022, limbs: 4 },
	broadleaf: { centre: 0.6, radius: 0.4, stretch: 0.78, lobes: 7, cards: 200, cardSize: 0.24, droop: 0, trunkHeight: 0.36, trunkRadius: 0.034, limbs: 5 },
	willow: { centre: 0.55, radius: 0.46, stretch: 0.66, lobes: 6, cards: 170, cardSize: 0.26, droop: 0.4, trunkHeight: 0.36, trunkRadius: 0.05, limbs: 5 },
	bush: { centre: 0.5, radius: 0.52, stretch: 0.72, lobes: 4, cards: 70, cardSize: 0.36, droop: 0, trunkHeight: 0.12, trunkRadius: 0.03, limbs: 0 }
};
