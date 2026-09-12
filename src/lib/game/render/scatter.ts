import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { toScene, type Point } from '../scene/lakeShape';

export interface SceneBounds {
	left: number;
	top: number;
	width: number;
	height: number;
}

const LowDiscrepancyStride = { Across: 0.7548776662, Down: 0.569840291 } as const;

export function sceneBoundsOf(fractions: LayoutPoint[]): SceneBounds {
	const points = fractions.map(toScene);
	const acrosses = points.map((point) => point.x);
	const downs = points.map((point) => point.y);
	const left = Math.min(...acrosses);
	const top = Math.min(...downs);
	return { left, top, width: Math.max(...acrosses) - left, height: Math.max(...downs) - top };
}

export function scatterWithin(bounds: SceneBounds, count: number): Point[] {
	return Array.from({ length: count }, (_, index) => ({
		x: bounds.left + fractionAlong(index, LowDiscrepancyStride.Across) * bounds.width,
		y: bounds.top + fractionAlong(index, LowDiscrepancyStride.Down) * bounds.height
	}));
}

export function countForArea(bounds: SceneBounds, pixelsPerItem: number, maximum: number) {
	return Math.min(maximum, Math.round((bounds.width * bounds.height) / pixelsPerItem));
}

function fractionAlong(index: number, stride: number) {
	return ((index + 1) * stride) % 1;
}
