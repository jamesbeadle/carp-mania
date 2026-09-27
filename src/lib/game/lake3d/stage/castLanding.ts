import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { isPointInPolygon } from '$lib/domain/layout/pointInPolygon';
import { isInWater } from '$lib/domain/layout/waterArea';

export type CastProblem = 'on_the_bank' | 'through_an_island' | null;

const LineSamples = 40;

function pointAlong(from: LayoutPoint, to: LayoutPoint, share: number): LayoutPoint {
	return { x: from.x + (to.x - from.x) * share, y: from.y + (to.y - from.y) * share };
}

function crossesAnIsland(layout: LakeLayout, from: LayoutPoint, to: LayoutPoint) {
	const samples = Array.from({ length: LineSamples - 1 }, (_, index) => pointAlong(from, to, (index + 1) / LineSamples));
	return samples.some((sample) => layout.islands.some((island) => isPointInPolygon(sample, island.points)));
}

export function castProblemOf(layout: LakeLayout, from: LayoutPoint, to: LayoutPoint): CastProblem {
	if (!isInWater(layout, to)) return 'on_the_bank';
	if (crossesAnIsland(layout, from, to)) return 'through_an_island';
	return null;
}
