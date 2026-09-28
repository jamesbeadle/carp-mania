import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';

const Shore = { DropMetres: 1.1, WaterlineDip: 0.06, ShelfMetres: 9 } as const;
const FarFromWater = 150;
const EdgeFadeFrom = 0.7;
const Hills = { StartMetres: 28, FullMetres: 90, Height: 5.5, Wavelength: 70 } as const;

export interface TerrainPlan {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	bedDepth: number;
	isFlatBeyond: boolean;
	edgeMetres: number;
}

function rollingHills(point: WorldPoint) {
	const across = point.x / Hills.Wavelength;
	const down = point.z / Hills.Wavelength;
	const wave = Math.sin(across * 1.3 + Math.cos(down * 0.7)) * 0.5 + Math.sin(down * 1.1 - across * 0.4) * 0.35 + Math.sin((across + down) * 2.7) * 0.15;
	return (wave * 0.5 + 0.5) * Hills.Height;
}

export interface Bounds {
	least: WorldPoint;
	most: WorldPoint;
}

function boundsOf(points: WorldPoint[]): Bounds {
	const xs = points.map((point) => point.x);
	const zs = points.map((point) => point.z);
	return { least: { x: Math.min(...xs), z: Math.min(...zs) }, most: { x: Math.max(...xs), z: Math.max(...zs) } };
}

function distanceOutside(point: WorldPoint, bounds: Bounds) {
	const { least, most } = bounds;
	const across = Math.max(least.x - point.x, 0, point.x - most.x);
	const down = Math.max(least.z - point.z, 0, point.z - most.z);
	return Math.hypot(across, down);
}

export class TerrainShape {
	private readonly lakeBounds: Bounds;

	constructor(private readonly plan: TerrainPlan) {
		this.lakeBounds = boundsOf(plan.outline);
	}

	heightAt(point: WorldPoint) {
		const { outline, islands } = this.plan;
		if (distanceOutside(point, this.lakeBounds) > FarFromWater) return this.landHeight(point, FarFromWater, Heights.Bank);
		if (!isInsideOutline(point, outline)) return this.landHeight(point, distanceToOutline(point, outline), Heights.Bank);
		const island = islands.find((shape) => isInsideOutline(point, shape));
		if (island) return this.landHeight(point, distanceToOutline(point, island), Heights.Island);
		const toShore = Math.min(distanceToOutline(point, outline), ...islands.map((shape) => distanceToOutline(point, shape)));
		return -Shore.WaterlineDip - this.plan.bedDepth * MathUtils.smoothstep(toShore, 0, Shore.ShelfMetres);
	}

	private landHeight(point: WorldPoint, fromWater: number, top: number) {
		const bank = MathUtils.lerp(-Shore.WaterlineDip, top, MathUtils.smoothstep(fromWater, 0, Shore.DropMetres));
		if (this.plan.isFlatBeyond) return bank;
		const towardsTheEdge = Math.max(Math.abs(point.x), Math.abs(point.z));
		const edgeFade = 1 - MathUtils.smoothstep(towardsTheEdge, this.plan.edgeMetres * EdgeFadeFrom, this.plan.edgeMetres);
		return bank + rollingHills(point) * MathUtils.smoothstep(fromWater, Hills.StartMetres, Hills.FullMetres) * edgeFade;
	}
}
