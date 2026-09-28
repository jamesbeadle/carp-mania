import { Vector4 } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { headingOverTheWater, podSpotFacing, type WaterShape } from '../swimFacing';

export const MostWornSwims = 24;

export function swimWearOf(pegs: WorldPoint[], water: WaterShape) {
	const worn = pegs.slice(0, MostWornSwims).map((peg) => {
		const pod = podSpotFacing(peg, headingOverTheWater(peg, water), water);
		return new Vector4(peg.x, peg.z, pod.x, pod.z);
	});
	const padding = Array.from({ length: MostWornSwims - worn.length }, () => new Vector4());
	return { paths: [...worn, ...padding], count: worn.length };
}
