import { Vector3, type Mesh, type Object3D } from 'three';

const SmallCaster = { LargestRadiusMetres: 1.6, ReachMetres: 48 } as const;

function isMesh(object: Object3D): object is Mesh {
	return (object as Mesh).isMesh === true;
}

function radiusOf(mesh: Mesh) {
	const { geometry } = mesh;
	if (!geometry.boundingSphere) geometry.computeBoundingSphere();
	const radius = geometry.boundingSphere?.radius ?? Infinity;
	return radius * mesh.matrixWorld.getMaxScaleOnAxis();
}

export class SmallShadowCasters {
	private readonly radii = new WeakMap<Mesh, number>();
	private readonly place = new Vector3();

	constructor(private readonly root: Object3D) {}

	keepNear(eye: Vector3) {
		this.root.traverseVisible((object) => this.consider(object, eye));
	}

	private consider(object: Object3D, eye: Vector3) {
		if (!isMesh(object)) return;
		const isInstanced = 'isInstancedMesh' in object;
		if (isInstanced) return;
		const radius = this.radiusOfCaster(object);
		if (radius > SmallCaster.LargestRadiusMetres) return;
		this.place.setFromMatrixPosition(object.matrixWorld);
		object.castShadow = this.place.distanceTo(eye) < SmallCaster.ReachMetres + radius;
	}

	private radiusOfCaster(mesh: Mesh) {
		const known = this.radii.get(mesh);
		if (known !== undefined) return known;
		const radius = mesh.castShadow ? radiusOf(mesh) : Infinity;
		this.radii.set(mesh, radius);
		return radius;
	}
}
