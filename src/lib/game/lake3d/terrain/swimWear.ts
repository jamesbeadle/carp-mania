import type { WorldPoint } from '../lakeFrame';
import { headingOverTheWater, podSpotFacing, type WaterShape } from '../swimFacing';

export interface SwimGround {
	peg: WorldPoint;
	pod: WorldPoint;
	heading: number;
}

function swimGroundOf(peg: WorldPoint, water: WaterShape): SwimGround {
	const heading = headingOverTheWater(peg, water);
	return { peg, pod: podSpotFacing(peg, heading, water), heading };
}

export function swimGroundsOf(pegs: WorldPoint[], water: WaterShape): SwimGround[] {
	return pegs.map((peg) => swimGroundOf(peg, water));
}
