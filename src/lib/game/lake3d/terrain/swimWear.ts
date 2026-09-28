import type { WorldPoint } from '../lakeFrame';
import { headingOverTheWater, podSpotFacing, type WaterShape } from '../swimFacing';

export interface SwimGround {
	peg: WorldPoint;
	pod: WorldPoint;
}

export function swimGroundsOf(pegs: WorldPoint[], water: WaterShape): SwimGround[] {
	return pegs.map((peg) => ({ peg, pod: podSpotFacing(peg, headingOverTheWater(peg, water), water) }));
}
