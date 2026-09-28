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

export function metresFromAnySwim(point: WorldPoint, clearings: SwimClearing[]) {
	return clearings.reduce((nearest, clearing) => Math.min(nearest, distanceToSegment(point, clearing.peg, clearing.pod)), Infinity);
}

export function metresFromAnyPod(point: WorldPoint, clearings: SwimClearing[]) {
	return clearings.reduce((nearest, clearing) => Math.min(nearest, metresBetween(point, clearing.pod)), Infinity);
}
