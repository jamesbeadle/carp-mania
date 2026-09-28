import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';
import { isInsideOutline } from '../worldGeometry';
import { ShoreIndex, type ShoreHit } from './shoreIndex';
import { bankHeight, bedHeight, Shore } from './shoreProfile';
import { SwimFootings } from './swimFootings';

const FarFromWater = 150;
const EdgeFadeFrom = 0.7;
const Hills = { StartMetres: 28, FullMetres: 90, Height: 5.5, Wavelength: 70 } as const;
const ShoreReach = Hills.FullMetres + 10;

export interface TerrainPlan {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	bedDepth: number;
	isFlatBeyond: boolean;
	edgeMetres: number;
	pods: WorldPoint[];
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

export function boundsOf(points: WorldPoint[]): Bounds {
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
	readonly lakeBounds: Bounds;
	private readonly shore: ShoreIndex;
	private readonly footings: SwimFootings;

	constructor(readonly plan: TerrainPlan) {
		this.lakeBounds = boundsOf(plan.outline);
		this.shore = new ShoreIndex(plan.outline, plan.islands, ShoreReach);
		this.footings = new SwimFootings(plan.pods, (point) => this.shore.nearest(point, ShoreReach)?.distance ?? ShoreReach);
	}

	nearestShore(point: WorldPoint, reachMetres: number): ShoreHit | null {
		return this.shore.nearest(point, reachMetres);
	}

	heightAt(point: WorldPoint) {
		return this.surfaceAt(point).height;
	}

	surfaceAt(point: WorldPoint): { height: number; hit: ShoreHit | null } {
		if (distanceOutside(point, this.lakeBounds) > FarFromWater) return { height: this.landHeight(point, FarFromWater, false), hit: null };
		const hit = this.shore.nearest(point, ShoreReach);
		return { height: hit ? this.heightNear(point, hit) : this.heightFarFromShore(point), hit };
	}

	heightNear(point: WorldPoint, hit: ShoreHit) {
		if (hit.isWater) return bedHeight(hit.distance, this.plan.bedDepth);
		return this.landHeight(point, hit.distance, hit.isIsland);
	}

	private heightFarFromShore(point: WorldPoint) {
		const { outline, islands } = this.plan;
		const isWater = isInsideOutline(point, outline) && !islands.some((island) => isInsideOutline(point, island));
		return isWater ? bedHeight(ShoreReach, this.plan.bedDepth) : this.landHeight(point, ShoreReach, false);
	}

	private dropAt(point: WorldPoint, fromWater: number, isIsland: boolean) {
		if (isIsland) return Shore.IslandDropMetres;
		return fromWater > Shore.DropMetres ? Shore.DropMetres : Shore.DropMetres * this.footings.dropShareAt(point);
	}

	private landHeight(point: WorldPoint, fromWater: number, isIsland: boolean) {
		const bank = bankHeight(fromWater, isIsland ? Heights.Island : Heights.Bank, point.x, point.z, this.dropAt(point, fromWater, isIsland));
		if (this.plan.isFlatBeyond) return bank;
		const towardsTheEdge = Math.max(Math.abs(point.x), Math.abs(point.z));
		const edgeFade = 1 - MathUtils.smoothstep(towardsTheEdge, this.plan.edgeMetres * EdgeFadeFrom, this.plan.edgeMetres);
		return bank + rollingHills(point) * MathUtils.smoothstep(fromWater, Hills.StartMetres, Hills.FullMetres) * edgeFade;
	}
}
