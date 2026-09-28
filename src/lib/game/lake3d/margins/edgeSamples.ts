import type { WorldPoint } from '../lakeFrame';

export interface EdgeSample {
	point: WorldPoint;
	along: number;
}

export function resampledLoop(edge: WorldPoint[], stepMetres: number): EdgeSample[] {
	const samples: EdgeSample[] = [];
	let travelled = 0;
	edge.forEach((start, index) => {
		const end = edge[(index + 1) % edge.length];
		const length = Math.hypot(end.x - start.x, end.z - start.z);
		const steps = Math.max(1, Math.ceil(length / stepMetres));
		for (let step = 0; step < steps; step++) {
			const share = step / steps;
			samples.push({ point: { x: start.x + (end.x - start.x) * share, z: start.z + (end.z - start.z) * share }, along: travelled + length * share });
		}
		travelled += length;
	});
	const closing = samples[0];
	return closing ? [...samples, { point: closing.point, along: travelled }] : samples;
}
