import { metresBetween, type WorldPoint } from '../lakeFrame';
import { headingOverTheWater, podSpotFacing, type WaterShape } from '../swimFacing';
import { distanceToSegment } from '../worldGeometry';

export interface SwimClearing {
	peg: WorldPoint;
	pod: WorldPoint;
}

export function swimClearingsFor(pegs: WorldPoint[], water: WaterShape): SwimClearing[] {
	return pegs.map((peg) => ({ peg, pod: podSpotFacing(peg, headingOverTheWater(peg, water), water) }));
}

export const SwimGround = { PodRadius: 2.5, PegRadius: 1.8, PathRadius: 0.9 } as const;

function metresBeyond(point: WorldPoint, clearing: SwimClearing) {
	const { peg, pod } = clearing;
	const beyondPod = metresBetween(point, pod) - SwimGround.PodRadius;
	const beyondPeg = metresBetween(point, peg) - SwimGround.PegRadius;
	return Math.min(beyondPod, beyondPeg, distanceToSegment(point, peg, pod) - SwimGround.PathRadius);
}

export function metresFromAnySwim(point: WorldPoint, clearings: SwimClearing[]) {
	return clearings.reduce((nearest, clearing) => Math.min(nearest, metresBeyond(point, clearing)), Infinity);
}

export function metresFromAnyPod(point: WorldPoint, clearings: SwimClearing[]) {
	return clearings.reduce((nearest, clearing) => Math.min(nearest, metresBetween(point, clearing.pod)), Infinity);
}
