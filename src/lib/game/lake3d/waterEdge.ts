import type { WorldPoint } from './lakeFrame';
import { shoreRingOf } from './terrain/shoreRings';

export const WaterEdge = { ReachOntoTheBankMetres: 0.7 } as const;

export function pushedTowardsLand(points: WorldPoint[], isIsland: boolean): WorldPoint[] {
	const { cornerOutwards } = shoreRingOf(points, isIsland, 0);
	const towardsLand = isIsland ? -WaterEdge.ReachOntoTheBankMetres : WaterEdge.ReachOntoTheBankMetres;
	return points.map((point, index) => {
		const outward = cornerOutwards[index];
		const length = Math.hypot(outward.x, outward.z) || 1;
		return { x: point.x + (outward.x / length) * towardsLand, z: point.z + (outward.z / length) * towardsLand };
	});
}
