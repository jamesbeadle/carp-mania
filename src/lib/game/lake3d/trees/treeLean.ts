import { MathUtils } from 'three';
import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { TreeKind } from './treeKinds';
import type { WaterEdge } from './waterEdge';

const LeanDegrees: Record<TreeKind, { least: number; range: number }> = {
	willow: { least: 5, range: 9 },
	alder: { least: 2, range: 5 },
	oak: { least: 0, range: 3 },
	birch: { least: 2, range: 7 },
	poplar: { least: 0, range: 1.5 },
	pine: { least: 0, range: 4 },
	spruce: { least: 0, range: 1.5 },
	holly: { least: 0, range: 5 }
};
const WatersideReach = 14;
const Probe = 1;

export interface Lean {
	lean: number;
	leanHeading: number;
}

function waterwardHeading(point: WorldPoint, water: WaterEdge) {
	const east = water.metresFromWater({ x: point.x + Probe, z: point.z });
	const west = water.metresFromWater({ x: point.x - Probe, z: point.z });
	const south = water.metresFromWater({ x: point.x, z: point.z + Probe });
	const north = water.metresFromWater({ x: point.x, z: point.z - Probe });
	return Math.atan2(west - east, north - south);
}

export function leanOf(kind: TreeKind, point: WorldPoint, distanceFromWater: number, water: WaterEdge, random: RandomFraction): Lean {
	const degrees = LeanDegrees[kind];
	const lean = MathUtils.degToRad(degrees.least + random() * degrees.range);
	const isWaterside = distanceFromWater < WatersideReach;
	const leanHeading = isWaterside ? waterwardHeading(point, water) : random() * Math.PI * 2;
	return { lean, leanHeading };
}
