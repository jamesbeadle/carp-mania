import { MathUtils } from 'three';
import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { distanceToOutline } from '../worldGeometry';
import type { TreeKind } from './treeKinds';

const LeanDegrees: Record<TreeKind, { least: number; range: number }> = {
	willow: { least: 5, range: 9 },
	alder: { least: 2, range: 5 },
	oak: { least: 0, range: 3 },
	birch: { least: 1, range: 5 },
	poplar: { least: 0, range: 1.5 },
	pine: { least: 0, range: 4 },
	spruce: { least: 0, range: 1.5 }
};
const WatersideReach = 14;
const Probe = 1;

export interface Lean {
	lean: number;
	leanHeading: number;
}

function waterwardHeading(point: WorldPoint, outline: WorldPoint[]) {
	const east = distanceToOutline({ x: point.x + Probe, z: point.z }, outline);
	const west = distanceToOutline({ x: point.x - Probe, z: point.z }, outline);
	const south = distanceToOutline({ x: point.x, z: point.z + Probe }, outline);
	const north = distanceToOutline({ x: point.x, z: point.z - Probe }, outline);
	return Math.atan2(west - east, north - south);
}

export function leanOf(kind: TreeKind, point: WorldPoint, distanceFromWater: number, outline: WorldPoint[], random: RandomFraction): Lean {
	const degrees = LeanDegrees[kind];
	const lean = MathUtils.degToRad(degrees.least + random() * degrees.range);
	const isWaterside = distanceFromWater < WatersideReach;
	const leanHeading = isWaterside ? waterwardHeading(point, outline) : random() * Math.PI * 2;
	return { lean, leanHeading };
}
