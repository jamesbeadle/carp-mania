import type { LayoutPoint } from '../../layout/layoutTypes';
import type { SceneDistance } from '../bankAnchor';
import { MaximumPointsPerDraft } from '../isWorkDraft';
import { between, evenlySpaced, respaced, spacingFor } from './bankSpacing';

export interface BankBrush {
	at: LayoutPoint;
	radiusScenePixels: number;
}

const SmoothingPerStroke = 0.35;
const PlotEdge = { Near: 0, Far: 1 } as const;

function falloffAt(point: LayoutPoint, brush: BankBrush, distance: SceneDistance) {
	const reach = distance(point, brush.at) / brush.radiusScenePixels;
	if (reach >= 1) return 0;
	const softened = 1 - reach * reach;
	return softened * softened;
}

function keptOnThePlot(value: number) {
	return Math.min(PlotEdge.Far, Math.max(PlotEdge.Near, value));
}

export function pushBank(outline: LayoutPoint[], brush: BankBrush, movedBy: LayoutPoint, distance: SceneDistance): LayoutPoint[] {
	const pushed = outline.map((point) => {
		const weight = falloffAt(point, brush, distance);
		return { x: keptOnThePlot(point.x + movedBy.x * weight), y: keptOnThePlot(point.y + movedBy.y * weight) };
	});
	const kept = respaced(pushed, spacingFor(outline, distance), distance);
	const isWithinThePointLimit = kept.length <= MaximumPointsPerDraft;
	return isWithinThePointLimit ? kept : evenlySpaced(kept, spacingFor(kept, distance), distance);
}

export function smoothBank(outline: LayoutPoint[], brush: BankBrush, distance: SceneDistance): LayoutPoint[] {
	return outline.map((point, index) => {
		const weight = falloffAt(point, brush, distance) * SmoothingPerStroke;
		if (weight === 0) return point;
		const before = outline[(index - 1 + outline.length) % outline.length];
		const after = outline[(index + 1) % outline.length];
		return between(point, between(before, after, 0.5), weight);
	});
}
