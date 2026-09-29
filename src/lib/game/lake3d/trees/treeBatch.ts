import { BatchedMesh, type BufferGeometry, type Material, type Matrix4, type Vector4 } from 'three';
import type { TreeParts } from './treeParts';

function totalOf(geometries: BufferGeometry[], count: (geometry: BufferGeometry) => number) {
	return geometries.reduce((sum, geometry) => sum + count(geometry), 0);
}

export class TreeBatch implements TreeParts {
	readonly meshes: BatchedMesh[];
	readonly distantMeshes: BatchedMesh[] = [];
	private readonly mesh: BatchedMesh;
	private readonly geometryIds: number[][];

	constructor(geometriesByModel: BufferGeometry[][], material: Material, plantingsByModel: number[]) {
		const geometries = geometriesByModel.flat();
		const vertices = totalOf(geometries, (geometry) => geometry.getAttribute('position').count);
		const indices = totalOf(geometries, (geometry) => geometry.getIndex()?.count ?? 0);
		const instances = plantingsByModel.reduce((sum, count) => sum + count, 0);
		this.mesh = new BatchedMesh(Math.max(1, instances), vertices, indices, material);
		this.mesh.sortObjects = false;
		this.meshes = [this.mesh];
		this.geometryIds = geometriesByModel.map((models) => models.map((geometry) => this.mesh.addGeometry(geometry)));
		geometries.forEach((geometry) => geometry.dispose());
	}

	plant(model: number, detail: number, placement: Matrix4, colour: Vector4 | null) {
		const instance = this.mesh.addInstance(this.geometryIds[model][detail]);
		this.mesh.setMatrixAt(instance, placement);
		if (colour) this.mesh.setColorAt(instance, colour);
		return instance;
	}

	show(instance: number, model: number, detail: number) {
		this.mesh.setGeometryIdAt(instance, this.geometryIds[model][detail]);
	}
}
