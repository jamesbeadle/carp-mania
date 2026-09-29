import { Frustum, Matrix4, Sphere, Vector3, type Camera } from 'three';
import type { WorldPoint } from '../lakeFrame';

const GroundLevel = 0;

export class CoverSight {
	private readonly eye: Vector3;
	private readonly frustum = new Frustum();
	private readonly sphere = new Sphere();

	constructor(camera: Camera) {
		camera.updateMatrixWorld();
		this.eye = camera.position;
		this.frustum.setFromProjectionMatrix(new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
	}

	metresTo(centre: WorldPoint) {
		return Math.hypot(this.eye.x - centre.x, this.eye.z - centre.z);
	}

	isShowing(centre: WorldPoint, extentMetres: number, sightMetres: number) {
		const isWithinReach = this.metresTo(centre) < sightMetres;
		const { sphere } = this;
		sphere.center.set(centre.x, GroundLevel, centre.z);
		sphere.radius = extentMetres;
		return isWithinReach && this.frustum.intersectsSphere(sphere);
	}
}
