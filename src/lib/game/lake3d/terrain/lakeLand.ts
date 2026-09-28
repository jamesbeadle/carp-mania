import { Group } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { Heights, slabSides } from '../lakeGround';
import { renderQuality } from '../renderQuality';
import { farGround } from './farGround';
import { createFarHills } from './farHills';
import { createGroundMeshes } from './groundMeshes';
import { bakeShoreMap } from './shoreMap';
import { swimWearOf } from './swimWear';
import { TerrainShape } from './terrainShape';

export interface LandPlan {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	plotReach: number;
	plotEdge: WorldPoint | null;
	season: SeasonName;
	bed: BedType;
	bedDepth: number;
	pegs: WorldPoint[];
	clock: { value: number };
}

const Grid = { ReachShare: 1.6, MetresPerCell: 1.7, MostCells: 420, DioramaMetresPerCell: 1.2 } as const;
const ShoreMapTexelsPerStation = 2;

export function createLakeLand(plan: LandPlan) {
	const half = plan.plotEdge ?? { x: plan.plotReach * Grid.ReachShare, z: plan.plotReach * Grid.ReachShare };
	const shape = new TerrainShape({ outline: plan.outline, islands: plan.islands, bedDepth: plan.bedDepth, isFlatBeyond: plan.plotEdge !== null, edgeMetres: Math.max(half.x, half.z) });
	const metresPerCell = plan.plotEdge ? Grid.DioramaMetresPerCell : Grid.MetresPerCell;
	const look = { season: plan.season, bed: plan.bed, wear: swimWearOf(plan.pegs, plan), clock: plan.clock };
	const group = new Group().add(...createGroundMeshes(shape, { half, metresPerCell, mostCells: Grid.MostCells, plotEdge: plan.plotEdge, look }));
	group.add(plan.plotEdge ? slabSides(plan.plotEdge, plan.bedDepth) : farGround(half));
	if (!plan.plotEdge) group.add(createFarHills(Math.hypot(half.x, half.z), Heights.Bank));
	const shoreMap = bakeShoreMap(shape, renderQuality().shoreSpacingMetres / ShoreMapTexelsPerStation);
	return { group, groundAt: (point: WorldPoint) => shape.heightAt(point), shoreMap };
}
