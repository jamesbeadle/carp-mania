import { Box3, Color, InstancedBufferAttribute, InstancedMesh, Vector3, type BufferGeometry, type Camera, type Material } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import { NearDetailLayer } from '../renderQuality';
import type { WorldPoint } from '../lakeFrame';
import { sharingShape } from './coverCards';
import type { CoverPlant } from './coverScatter';
import { hiddenBeyond } from './chunkHiding';
import { keptShareAt, thinningReach } from './coverThinning';
import { placementOf } from './plantPlacement';
import { tintColour } from './plantTint';

export interface ChunkPlan {
	name: string;
	geometry: BufferGeometry;
	material: Material;
	groundAt: (point: WorldPoint) => number;
	sink: number;
	mostReach: number;
	seed: number;
	shadowMaterial?: Material;
	detailLayer?: number;
}

export interface Chunking extends ChunkPlan {
	metres: number;
}

const AttributeSize = 3;

function shuffled(plants: CoverPlant[], random: RandomFraction) {
	const order = [...plants];
	for (let index = order.length - 1; index > 0; index--) {
		const swap = Math.floor(random() * (index + 1));
		[order[index], order[swap]] = [order[swap], order[index]];
	}
	return order;
}

function thinnedByDistance(mesh: InstancedMesh, plan: ChunkPlan, total: number) {
	mesh.computeBoundingBox();
	const bounds = new Box3().copy(mesh.boundingBox ?? new Box3());
	const nearest = new Vector3();
	mesh.onBeforeRender = (_renderer, _scene, camera: Camera) => {
		if (!camera.layers.isEnabled(NearDetailLayer)) return;
		const metres = bounds.clampPoint(camera.position, nearest).distanceTo(camera.position);
		mesh.count = Math.min(total, Math.ceil(total * keptShareAt(metres / plan.mostReach)));
	};
}

function castsShadowWith(mesh: InstancedMesh, shadowMaterial: Material | undefined) {
	if (!shadowMaterial) return;
	mesh.castShadow = true;
	mesh.customDepthMaterial = shadowMaterial;
}

function chunkMesh(plants: CoverPlant[], plan: ChunkPlan) {
	const geometry = sharingShape(plan.geometry);
	const attribute = new Float32Array(plants.length * AttributeSize);
	const mesh = new InstancedMesh(geometry, plan.material, plants.length);
	const colour = new Color();
	mesh.name = plan.name;
	plants.forEach((plant, index) => {
		mesh.setMatrixAt(index, placementOf(plant, plan.groundAt, plan.sink));
		mesh.setColorAt(index, tintColour(plant.tint, colour));
		attribute.set([plant.cell, index / plants.length, plant.reach], index * AttributeSize);
	});
	geometry.setAttribute('coverPlant', new InstancedBufferAttribute(attribute, AttributeSize));
	mesh.computeBoundingSphere();
	mesh.receiveShadow = true;
	castsShadowWith(mesh, plan.shadowMaterial);
	thinnedByDistance(mesh, plan, plants.length);
	return hiddenBeyond(mesh, thinningReach().goneBeyond * plan.mostReach);
}

export function coverChunk(plants: CoverPlant[], plan: ChunkPlan, random: RandomFraction) {
	if (plants.length === 0) return null;
	const levels = chunkMesh(shuffled(plants, random), plan);
	const { detailLayer } = plan;
	if (detailLayer === undefined) return levels;
	levels.traverse((part) => part.layers.set(detailLayer));
	return levels;
}

export function coverChunks(plants: CoverPlant[], plan: Chunking) {
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
