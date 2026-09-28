import { Group, Mesh, MeshStandardMaterial, Shape, ShapeGeometry, Vector2 } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { Heights, slabSides } from '../lakeGround';
import { createFarHills } from './farHills';
import { createTerrainMesh } from './terrainMesh';
import { TerrainShape } from './terrainShape';

export interface LandPlan {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	plotReach: number;
	plotEdge: WorldPoint | null;
	season: SeasonName;
	bed: BedType;
	bedDepth: number;
}

const Grid = { ReachShare: 1.6, MetresPerCell: 1.7, MostCells: 420, DioramaMetresPerCell: 1.2 } as const;
const FarGround = { Size: 10000, Sink: 0.3, Colour: '#4f6e2c', Overlap: 0.98 } as const;

function squareAround(halfWidth: number, halfDepth: number) {
	return [new Vector2(-halfWidth, -halfDepth), new Vector2(halfWidth, -halfDepth), new Vector2(halfWidth, halfDepth), new Vector2(-halfWidth, halfDepth)];
}

function farGround(inner: WorldPoint) {
	const outer = new Shape(squareAround(FarGround.Size, FarGround.Size));
	outer.holes = [new Shape(squareAround(inner.x * FarGround.Overlap, inner.z * FarGround.Overlap))];
	const mesh = new Mesh(new ShapeGeometry(outer).rotateX(-Math.PI / 2), new MeshStandardMaterial({ color: FarGround.Colour, roughness: 1 }));
	mesh.position.setY(Heights.Bank - FarGround.Sink);
	mesh.receiveShadow = true;
	return mesh;
}

export function createLakeLand(plan: LandPlan) {
	const half = plan.plotEdge ?? { x: plan.plotReach * Grid.ReachShare, z: plan.plotReach * Grid.ReachShare };
	const shape = new TerrainShape({ outline: plan.outline, islands: plan.islands, bedDepth: plan.bedDepth, isFlatBeyond: plan.plotEdge !== null, edgeMetres: Math.max(half.x, half.z) });
	const metresPerCell = plan.plotEdge ? Grid.DioramaMetresPerCell : Grid.MetresPerCell;
	const terrain = createTerrainMesh(shape, { width: half.x * 2, depth: half.z * 2, metresPerCell, mostCells: Grid.MostCells }, plan);
	const group = new Group().add(terrain);
	group.add(plan.plotEdge ? slabSides(plan.plotEdge, plan.bedDepth) : farGround(half));
	if (!plan.plotEdge) group.add(createFarHills(Math.hypot(half.x, half.z), Heights.Bank));
	return { group, groundAt: (point: WorldPoint) => shape.heightAt(point) };
}
