import { LOD, Object3D, Sphere, type InstancedMesh } from 'three';

export function hiddenBeyond(mesh: InstancedMesh, metres: number) {
	const bounds = mesh.boundingSphere ?? new Sphere();
	const { center } = bounds;
	const levels = new LOD();
	levels.position.copy(center);
	mesh.position.copy(center).negate();
	levels.addLevel(mesh, 0);
	levels.addLevel(new Object3D(), metres + bounds.radius);
	return levels;
}
