import { isAreaFeature, type AreaFeature, type AreaFeatureKind, type LakeLayout, type LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { polygonAreaFraction } from '$lib/domain/layout/polygonArea';

export function areaFeaturesOfKind(layout: LakeLayout, kind: AreaFeatureKind): AreaFeature[] {
	return layout.features.filter(isAreaFeature).filter((feature) => feature.kind === kind);
}

export function largestFirst<Shape extends { points: LayoutPoint[] }>(shapes: Shape[]): Shape[] {
	return [...shapes].sort((first, second) => polygonAreaFraction(second.points) - polygonAreaFraction(first.points));
}
