import type { BufferGeometry, Material, Matrix4, Mesh, Vector4 } from 'three';

export interface TreeParts {
	readonly meshes: Mesh[];
	readonly distantMeshes: Mesh[];
	plant(model: number, detail: number, placement: Matrix4, colour: Vector4 | null): number;
	show(planting: number, model: number, detail: number): void;
}

export type TreePartsMaker = new (geometriesByModel: BufferGeometry[][], material: Material, plantingsByModel: number[]) => TreeParts;
