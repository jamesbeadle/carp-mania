import { Matrix4, Quaternion, Vector3 } from 'three';
import type { WorldPoint } from '../lakeFrame';
import type { CoverPlant } from './coverScatter';

const Up = new Vector3(0, 1, 0);

export function placementOf(plant: CoverPlant, groundAt: (point: WorldPoint) => number, sink: number) {
	const { point } = plant;
	const leaning = new Quaternion().setFromAxisAngle(new Vector3(Math.cos(plant.turn), 0, Math.sin(plant.turn)), plant.lean);
	const turning = new Quaternion().setFromAxisAngle(Up, plant.turn);
	const position = new Vector3(point.x, groundAt(point) - sink, point.z);
	return new Matrix4().compose(position, leaning.multiply(turning), new Vector3(plant.width, plant.height, plant.width));
}
