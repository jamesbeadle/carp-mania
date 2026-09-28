import { metresBetween, type WorldPoint } from '../lakeFrame';
import { headingOverTheWater, podSpotFacing, type WaterShape } from '../swimFacing';
import { distanceToSegment } from '../worldGeometry';

export interface SwimClearing {
	peg: WorldPoint;
	pod: WorldPoint;
	heading: number;
}

const View = { Within: 12, SideFrom: 0.2, AheadFrom: 0.6 } as const;

export function swimClearingsFor(pegs: WorldPoint[], water: WaterShape): SwimClearing[] {
	return pegs.map((peg) => {
		const heading = headingOverTheWater(peg, water);
		return { peg, pod: podSpotFacing(peg, heading, water), heading };
	});
}

function aheadOfPod(point: WorldPoint, clearing: SwimClearing) {
	const { pod, heading } = clearing;
	const metres = metresBetween(point, pod);
	if (metres > View.Within) return 0;
	const facing = ((point.x - pod.x) * Math.sin(heading) + (point.z - pod.z) * Math.cos(heading)) / Math.max(metres, Number.EPSILON);
	return Math.min(1, Math.max(0, (facing - View.SideFrom) / (View.AheadFrom - View.SideFrom)));
}

export function viewAheadOfPods(point: WorldPoint, clearings: SwimClearing[]) {
	return clearings.reduce((most, clearing) => Math.max(most, aheadOfPod(point, clearing)), 0);
}

export const SwimGround = { PodRadius: 2.5, PegRadius: 1.8, PathRadius: 0.9 } as const;

function metresBeyond(point: WorldPoint, clearing: SwimClearing) {
	const { peg, pod } = clearing;
	const beyondPod = metresBetween(point, pod) - SwimGround.PodRadius;
	const beyondPeg = metresBetween(point, peg) - SwimGround.PegRadius;
	return Math.min(beyondPod, beyondPeg, distanceToSegment(point, peg, pod) - SwimGround.PathRadius);
}

export function metresFromAnySwim(point: WorldPoint, clearings: SwimClearing[]) {
	return clearings.reduce((nearest, clearing) => Math.min(nearest, metresBeyond(point, clearing)), Infinity);
}

export function metresFromAnyPod(point: WorldPoint, clearings: SwimClearing[]) {
	return clearings.reduce((nearest, clearing) => Math.min(nearest, metresBetween(point, clearing.pod)), Infinity);
}
