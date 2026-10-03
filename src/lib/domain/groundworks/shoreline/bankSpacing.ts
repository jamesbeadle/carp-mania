import type { LayoutPoint } from '../../layout/layoutTypes';
import type { SceneDistance } from '../bankAnchor';
import { MaximumPointsPerDraft } from '../isWorkDraft';

const Spacing = { FewestScenePixels: 14, MostPoints: MaximumPointsPerDraft - 20, MergeShare: 0.45, SplitShare: 1.8 } as const;

export function perimeterOf(outline: LayoutPoint[], distance: SceneDistance) {
	return outline.reduce((total, point, index) => total + distance(point, outline[(index + 1) % outline.length]), 0);
}

export function spacingFor(outline: LayoutPoint[], distance: SceneDistance) {
	return Math.max(Spacing.FewestScenePixels, perimeterOf(outline, distance) / Spacing.MostPoints);
}

export function evenlySpaced(outline: LayoutPoint[], spacing: number, distance: SceneDistance): LayoutPoint[] {
	return outline.flatMap((point, index) => {
		const next = outline[(index + 1) % outline.length];
		const pieces = Math.max(1, Math.round(distance(point, next) / spacing));
		return Array.from({ length: pieces }, (_, piece) => between(point, next, piece / pieces));
	});
}

export function respaced(outline: LayoutPoint[], spacing: number, distance: SceneDistance): LayoutPoint[] {
	const kept = outline.filter((point, index) => index === 0 || distance(point, outline[index - 1]) >= spacing * Spacing.MergeShare);
	return kept.flatMap((point, index) => {
		const next = kept[(index + 1) % kept.length];
		const isTooLong = distance(point, next) > spacing * Spacing.SplitShare;
		return isTooLong ? [point, between(point, next, 0.5)] : [point];
	});
}

export function between(start: LayoutPoint, end: LayoutPoint, share: number): LayoutPoint {
	return { x: start.x + (end.x - start.x) * share, y: start.y + (end.y - start.y) * share };
}
