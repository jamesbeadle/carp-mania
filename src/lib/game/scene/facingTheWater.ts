import { isInsideWater, type Point } from './lakeShape';

const Lookout = { Radius: 36, Samples: 16 } as const;

export interface WaterAround {
	lakePath: Path2D;
	islandPaths: Path2D[];
	centre: Point;
}

export function createFacingTheWater(context: CanvasRenderingContext2D, around: WaterAround) {
	const remembered = new Map<string, number>();
	return function facingTheWaterFrom(peg: Point) {
		const key = `${peg.x.toFixed(1)}:${peg.y.toFixed(1)}`;
		const known = remembered.get(key);
		if (known !== undefined) return known;
		const facing = facingMostWater(context, around, peg);
		remembered.set(key, facing);
		return facing;
	};
}

function facingMostWater(context: CanvasRenderingContext2D, around: WaterAround, peg: Point) {
	let towardsX = 0;
	let towardsY = 0;
	for (let sample = 0; sample < Lookout.Samples; sample++) {
		const angle = (sample / Lookout.Samples) * Math.PI * 2;
		const lookout = { x: peg.x + Math.cos(angle) * Lookout.Radius, y: peg.y + Math.sin(angle) * Lookout.Radius };
		if (!isInsideWater(context, around.lakePath, around.islandPaths, lookout)) continue;
		towardsX += Math.cos(angle);
		towardsY += Math.sin(angle);
	}
	const isWaterAllRound = Math.hypot(towardsX, towardsY) < 1e-6;
	if (isWaterAllRound) return Math.atan2(around.centre.y - peg.y, around.centre.x - peg.x);
	return Math.atan2(towardsY, towardsX);
}
