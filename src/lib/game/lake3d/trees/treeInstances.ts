import type { BufferGeometry, InstancedMesh, Material, Matrix4, Vector4 } from 'three';
import { InstanceSlots } from './instanceSlots';
import type { TreeParts } from './treeParts';

interface Placed {
	model: number;
	detail: number;
	slot: number;
	placement: Matrix4;
	colour: Vector4 | null;
}

export class TreeInstances implements TreeParts {
	readonly meshes: InstancedMesh[];
	readonly distantMeshes: InstancedMesh[];
	private readonly slots: InstanceSlots[][];
	private readonly placed: Placed[] = [];

	constructor(geometriesByModel: BufferGeometry[][], material: Material, plantingsByModel: number[]) {
		this.slots = geometriesByModel.map((geometries, model) => geometries.map((geometry) => new InstanceSlots(geometry, material, plantingsByModel[model])));
		this.meshes = this.slots.flat().map((slots) => slots.mesh);
		this.distantMeshes = this.slots.map((levels) => levels[levels.length - 1].mesh);
	}

	plant(model: number, detail: number, placement: Matrix4, colour: Vector4 | null) {
		const planting = this.placed.length;
		const slot = this.slots[model][detail].add(planting, placement, colour);
		this.placed.push({ model, detail, slot, placement, colour });
		return planting;
	}

	show(planting: number, model: number, detail: number) {
		const placed = this.placed[planting];
		const levels = this.slots[model];
		levels[placed.detail].remove(placed.slot, (owner, slot) => this.moved(owner, slot));
		placed.slot = levels[detail].add(planting, placed.placement, placed.colour);
		placed.detail = detail;
	}

	private moved(owner: number, slot: number) {
		this.placed[owner].slot = slot;
	}
}
