import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';

export function bearingFrom(centre: LayoutPoint, point: LayoutPoint, plotAcres: number) {
	const scale = layoutScaleFor(plotAcres);
	return Math.atan2((point.y - centre.y) * scale.feetDown, (point.x - centre.x) * scale.feetAcross);
}
