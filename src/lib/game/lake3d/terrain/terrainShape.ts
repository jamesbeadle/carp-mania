import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';
import { isInsideOutline } from '../worldGeometry';
import { boundsOf, distanceOutside, type Bounds } from './landBounds';
import { ShoreIndex, type ShoreHit } from './shoreIndex';
import { CharacterField } from './characterField';
import { MostRiseMetres } from './shoreCharacter';
import { bankHeight, bedHeight, Shore, type BankProfile } from './shoreProfile';
import { SwimFootings } from './swimFootings';

const FarFromWater = 150;
const EdgeFadeFrom = 0.7;
const Hills = { StartMetres: 28, FullMetres: 90, Height: 5.5, Wavelength: 70 } as const;
const ShoreReach = Hills.FullMetres + 10;
const IslandRise = { Gentlest: 1.3, Steepest: 0.8 } as const;
const WidestRiseMetres = Math.max(MostRiseMetres, Shore.IslandRiseMetres * IslandRise.Gentlest);

export interface TerrainPlan {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	bedDepth: number;
	isFlatBeyond: boolean;
	edgeMetres: number;
	footings: WorldPoint[];
}

function rollingHills(point: WorldPoint) {
	const across = point.x / Hills.Wavelength;
	const down = point.z / Hills.Wavelength;
	const wave = Math.sin(across * 1.3 + Math.cos(down * 0.7)) * 0.5 + Math.sin(down * 1.1 - across * 0.4) * 0.35 + Math.sin((across + down) * 2.7) * 0.15;
	return (wave * 0.5 + 0.5) * Hills.Height;
}

export class TerrainShape {
	readonly lakeBounds: Bounds;
	private readonly shore: ShoreIndex;
	private readonly footings: SwimFootings;
	readonly characters: CharacterField;

	constructor(readonly plan: TerrainPlan) {
		this.lakeBounds = boundsOf(plan.outline);
		this.characters = new CharacterField(this.lakeBounds);
		this.shore = new ShoreIndex(plan.outline, plan.islands, ShoreReach);
		this.footings = new SwimFootings(plan.footings);
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
		const character = this.characters.at(point.x, point.z);
		if (hit.isWater) return bedHeight(hit.distance, this.plan.bedDepth, character);
		return this.landHeight(point, hit.distance, hit.isIsland);
	}

	private heightFarFromShore(point: WorldPoint) {
		const { outline, islands } = this.plan;
		const isWater = isInsideOutline(point, outline) && !islands.some((island) => isInsideOutline(point, island));
		return isWater ? bedHeight(ShoreReach, this.plan.bedDepth, this.characters.at(point.x, point.z)) : this.landHeight(point, ShoreReach, false);
	}

	private bankProfile(point: WorldPoint, isIsland: boolean): BankProfile {
		const character = this.characters.at(point.x, point.z);
		const base = -Shore.WaterlineDip;
		if (isIsland) return { base, top: Heights.Island, riseMetres: Shore.IslandRiseMetres * MathUtils.lerp(IslandRise.Gentlest, IslandRise.Steepest, character.steepness) };
		return this.footings.profileAt(point, { base, top: Heights.Bank, riseMetres: character.riseMetres });
	}

	private bankAt(point: WorldPoint, fromWater: number, isIsland: boolean) {
		const top = isIsland ? Heights.Island : Heights.Bank;
		const isAboveTheRise = fromWater >= WidestRiseMetres;
		return isAboveTheRise ? top : bankHeight(fromWater, this.bankProfile(point, isIsland), point.x, point.z);
	}

	private landHeight(point: WorldPoint, fromWater: number, isIsland: boolean) {
		const bank = this.bankAt(point, fromWater, isIsland);
		if (this.plan.isFlatBeyond) return bank;
		const towardsTheEdge = Math.max(Math.abs(point.x), Math.abs(point.z));
		const edgeFade = 1 - MathUtils.smoothstep(towardsTheEdge, this.plan.edgeMetres * EdgeFadeFrom, this.plan.edgeMetres);
		return bank + rollingHills(point) * MathUtils.smoothstep(fromWater, Hills.StartMetres, Hills.FullMetres) * edgeFade;
	}
}
