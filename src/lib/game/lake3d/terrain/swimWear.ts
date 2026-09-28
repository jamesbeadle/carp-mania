import { Vector4 } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { headingOverTheWater, podSpotFacing, type WaterShape } from '../swimFacing';

export const MostWornSwims = 24;

export interface SwimGround {
	peg: WorldPoint;
	pod: WorldPoint;
}

export function swimGroundsOf(pegs: WorldPoint[], water: WaterShape): SwimGround[] {
	return pegs.map((peg) => ({ peg, pod: podSpotFacing(peg, headingOverTheWater(peg, water), water) }));
}

export function swimWearOf(swims: SwimGround[]) {
	const worn = swims.slice(0, MostWornSwims).map(({ peg, pod }) => new Vector4(peg.x, peg.z, pod.x, pod.z));
	const padding = Array.from({ length: MostWornSwims - worn.length }, () => new Vector4());
	return { paths: [...worn, ...padding], count: worn.length };
}
