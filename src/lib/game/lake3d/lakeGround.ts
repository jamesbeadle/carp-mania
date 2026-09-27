import { BackSide, BoxGeometry, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, ShapeGeometry } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { bedSpeckling, grassSpeckling, ShoreLook } from './groundLook';
import type { WorldPoint } from './lakeFrame';
import { speckledTexture } from './speckledTexture';
import { rectangleAround, shapeOf, shapeWithHoles } from './worldShapes';

export const Heights = { Bank: 0.45, Island: 0.9, BedDeepest: 3.2, ShallowestBed: 0.8, LandBeyondThePlot: 3, SlabBelowTheBed: 4, SlabTopGap: 0.01 } as const;

export interface GroundPlan {
	outline: WorldPoint[];
	plotEdge: WorldPoint | null;
	islands: WorldPoint[][];
	plotReach: number;
	season: SeasonName;
	bed: BedType;
	bedDepth: number;
}

function flatOnTheGround(mesh: Mesh, height: number) {
	mesh.rotateX(-Math.PI / 2);
	mesh.position.setY(height);
	mesh.receiveShadow = true;
	return mesh;
}

function grassMaterial(season: SeasonName) {
	return new MeshStandardMaterial({ map: speckledTexture(grassSpeckling(season)), roughness: 0.95 });
}

function landAround(plan: GroundPlan) {
	const halfSpan = plan.plotReach * Heights.LandBeyondThePlot;
	return plan.plotEdge ? rectangleAround(plan.plotEdge.x, plan.plotEdge.z) : rectangleAround(halfSpan, halfSpan);
}

function slabSides(edge: WorldPoint, bedDepth: number) {
	const depth = Heights.Bank + bedDepth + Heights.SlabBelowTheBed;
	const earth = new MeshStandardMaterial({ color: ShoreLook.Earth, roughness: 1 });
	const slab = new Mesh(new BoxGeometry(edge.x * 2, depth, edge.z * 2), [earth, earth, new MeshBasicMaterial({ visible: false }), earth, earth, earth]);
	slab.position.setY(Heights.Bank - depth / 2 - Heights.SlabTopGap);
	return slab;
}

function bank(plan: GroundPlan) {
	const geometry = new ShapeGeometry(shapeWithHoles(landAround(plan), [plan.outline]));
	return flatOnTheGround(new Mesh(geometry, grassMaterial(plan.season)), Heights.Bank);
}

function shoreWall(plan: GroundPlan) {
	const geometry = new ExtrudeGeometry(shapeOf(plan.outline), { depth: Heights.Bank + plan.bedDepth, bevelEnabled: false });
	const hidden = new MeshBasicMaterial({ visible: false });
	const earth = new MeshStandardMaterial({ color: ShoreLook.Earth, roughness: 1, side: BackSide });
	return flatOnTheGround(new Mesh(geometry, [hidden, earth]), -plan.bedDepth);
}

function lakeBed(plan: GroundPlan) {
	const material = new MeshStandardMaterial({ map: speckledTexture(bedSpeckling(plan.bed)), roughness: 1 });
	return flatOnTheGround(new Mesh(new ShapeGeometry(shapeOf(plan.outline)), material), -plan.bedDepth);
}

function island(points: WorldPoint[], plan: GroundPlan) {
	const shape = shapeOf(points);
	const geometry = new ExtrudeGeometry(shape, { depth: Heights.Island + plan.bedDepth, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 1.2, bevelSegments: 3 });
	const earth = new MeshStandardMaterial({ color: ShoreLook.Earth, roughness: 1 });
	const mesh = flatOnTheGround(new Mesh(geometry, [grassMaterial(plan.season), earth]), -plan.bedDepth);
	mesh.castShadow = true;
	return mesh;
}

export function createLakeGround(plan: GroundPlan) {
	const group = new Group();
	group.add(bank(plan), shoreWall(plan), lakeBed(plan));
	if (plan.plotEdge) group.add(slabSides(plan.plotEdge, plan.bedDepth));
	plan.islands.forEach((points) => group.add(island(points, plan)));
	return group;
}
