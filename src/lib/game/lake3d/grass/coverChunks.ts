import { Box3, InstancedBufferAttribute, InstancedMesh, Matrix4, Quaternion, Vector3, type BufferGeometry, type Camera, type Material } from 'three';
import { seededRandom } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { sharingShape } from './coverCards';
import type { CoverPlant } from './coverScatter';
import { keptShareAt } from './coverThinning';

export interface ChunkPlan {
	name: string;
	metres: number;
	geometry: BufferGeometry;
	material: Material;
	groundAt: (point: WorldPoint) => number;
	sink: number;
	mostReach: number;
	seed: number;
}

const Up = new Vector3(0, 1, 0);
const AttributeSize = 3;

function shuffled(plants: CoverPlant[], random: () => number) {
	const order = [...plants];
	for (let index = order.length - 1; index > 0; index--) {
		const swap = Math.floor(random() * (index + 1));
		[order[index], order[swap]] = [order[swap], order[index]];
	}
	return order;
}

function placementOf(plant: CoverPlant, plan: ChunkPlan) {
	const { point } = plant;
	const leaning = new Quaternion().setFromAxisAngle(new Vector3(Math.cos(plant.turn), 0, Math.sin(plant.turn)), plant.lean);
	const turning = new Quaternion().setFromAxisAngle(Up, plant.turn);
	const position = new Vector3(point.x, plan.groundAt(point) - plan.sink, point.z);
	return new Matrix4().compose(position, leaning.multiply(turning), new Vector3(plant.width, plant.height, plant.width));
}

function thinnedByDistance(mesh: InstancedMesh, plan: ChunkPlan, total: number) {
	mesh.computeBoundingBox();
	const bounds = new Box3().copy(mesh.boundingBox ?? new Box3());
	const nearest = new Vector3();
	mesh.onBeforeRender = (_renderer, _scene, camera: Camera) => {
		const metres = bounds.clampPoint(camera.position, nearest).distanceTo(camera.position);
		mesh.count = Math.min(total, Math.ceil(total * keptShareAt(metres / plan.mostReach)));
	};
}

function chunkMesh(plants: CoverPlant[], plan: ChunkPlan) {
	const geometry = sharingShape(plan.geometry);
	const attribute = new Float32Array(plants.length * AttributeSize);
	const mesh = new InstancedMesh(geometry, plan.material, plants.length);
	mesh.name = plan.name;
	plants.forEach((plant, index) => {
		mesh.setMatrixAt(index, placementOf(plant, plan));
		mesh.setColorAt(index, plant.tint);
		attribute.set([plant.cell, index / plants.length, plant.reach], index * AttributeSize);
	});
	geometry.setAttribute('coverPlant', new InstancedBufferAttribute(attribute, AttributeSize));
	mesh.computeBoundingSphere();
	mesh.receiveShadow = true;
	thinnedByDistance(mesh, plan, plants.length);
	return mesh;
}

export function coverChunks(plants: CoverPlant[], plan: ChunkPlan) {
	const random = seededRandom(plan.seed);
	const byChunk = new Map<string, CoverPlant[]>();
	plants.forEach((plant) => {
		const { point } = plant;
		const key = `${Math.floor(point.x / plan.metres)}:${Math.floor(point.z / plan.metres)}`;
		const chunk = byChunk.get(key) ?? [];
		chunk.push(plant);
		byChunk.set(key, chunk);
	});
	return [...byChunk.values()].map((chunk) => chunkMesh(shuffled(chunk, random), plan));
}
