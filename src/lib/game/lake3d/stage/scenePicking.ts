import { Plane, Raycaster, Vector2, Vector3, type Camera, type Object3D } from 'three';
import type { WorldPoint } from '../lakeFrame';

const WaterLevel = new Plane(new Vector3(0, 1, 0), 0);

function rayFrom(canvas: HTMLCanvasElement, camera: Camera, clientX: number, clientY: number) {
	const bounds = canvas.getBoundingClientRect();
	const pointer = new Vector2(((clientX - bounds.left) / bounds.width) * 2 - 1, -((clientY - bounds.top) / bounds.height) * 2 + 1);
	const raycaster = new Raycaster();
	raycaster.setFromCamera(pointer, camera);
	return raycaster;
}

export function pickedSwimId(canvas: HTMLCanvasElement, camera: Camera, targets: Object3D[], clientX: number, clientY: number): string | null {
	const hit = rayFrom(canvas, camera, clientX, clientY).intersectObjects(targets, false)[0];
	const target = hit?.object;
	const tagged = target?.userData as { swimId?: string } | undefined;
	return tagged?.swimId ?? null;
}

export function pickedWaterPoint(canvas: HTMLCanvasElement, camera: Camera, clientX: number, clientY: number): WorldPoint | null {
	const hit = rayFrom(canvas, camera, clientX, clientY).ray.intersectPlane(WaterLevel, new Vector3());
	return hit ? { x: hit.x, z: hit.z } : null;
}
