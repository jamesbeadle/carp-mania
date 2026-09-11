import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import type { Swim } from '../types';

const SceneCentre: LayoutPoint = { x: 0.5, y: 0.5 };

export function rescalePointForPlot(point: LayoutPoint, fromPlotAcres: number, toPlotAcres: number): LayoutPoint {
	const shrink = Math.sqrt(fromPlotAcres / toPlotAcres);
	return { x: SceneCentre.x + (point.x - SceneCentre.x) * shrink, y: SceneCentre.y + (point.y - SceneCentre.y) * shrink };
}

export function rescaleLayoutForPlot(layout: LakeLayout, fromPlotAcres: number, toPlotAcres: number): LakeLayout {
	const rescale = (points: LayoutPoint[]) => points.map((point) => rescalePointForPlot(point, fromPlotAcres, toPlotAcres));
	return {
		...layout,
		outline: rescale(layout.outline),
		islands: layout.islands.map((island) => ({ ...island, points: rescale(island.points) })),
		depthZones: layout.depthZones.map((zone) => ({ ...zone, points: rescale(zone.points) })),
		bedPatches: layout.bedPatches.map((patch) => ({ ...patch, points: rescale(patch.points) })),
		features: layout.features.map((feature) => (feature.kind === 'snag' ? { ...feature, point: rescalePointForPlot(feature.point, fromPlotAcres, toPlotAcres) } : { ...feature, points: rescale(feature.points) }))
	};
}

export function rescaleSwimForPlot(swim: Pick<Swim, 'position_x' | 'position_y'>, fromPlotAcres: number, toPlotAcres: number) {
	const moved = rescalePointForPlot({ x: Number(swim.position_x), y: Number(swim.position_y) }, fromPlotAcres, toPlotAcres);
	return { position_x: moved.x, position_y: moved.y };
}
