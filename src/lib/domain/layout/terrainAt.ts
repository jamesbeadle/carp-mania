import type { BedType, SwimFeature } from '../types';
import { feetToNearestEdge } from './distanceToEdge';
import type { LayoutScale } from './layoutScale';
import { isAreaFeature, isReedLine, isSnag, type LakeLayout, type LayoutPoint } from './layoutTypes';
import { isPointInPolygon } from './pointInPolygon';
import { polygonAreaFraction } from './polygonArea';
import { feetBetween } from './layoutScale';

export interface Terrain {
	bed: BedType;
	depthFeet: number;
	feature: SwimFeature;
}

export const FeatureReach = { SnagFeet: 25, IslandMarginFeet: 30, ReedLineFeet: 20 } as const;

export function terrainAt(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint): Terrain {
	return { bed: bedAt(layout, point), depthFeet: depthAt(layout, point), feature: featureAt(layout, scale, point) };
}

export function bedAt(layout: LakeLayout, point: LayoutPoint): BedType {
	const patch = innermost(layout.bedPatches, point);
	return patch?.bed ?? layout.baseBed;
}

export function depthAt(layout: LakeLayout, point: LayoutPoint) {
	const zone = innermost(layout.depthZones, point);
	return zone?.depthFeet ?? layout.baseDepthFeet;
}

export function featureAt(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint): SwimFeature {
	if (isNearSnag(layout, scale, point)) return 'snag';
	if (isNearIsland(layout, scale, point)) return 'island_margin';
	const area = areaFeatureAt(layout, point);
	if (area) return area;
	if (isNearReeds(layout, scale, point)) return 'reed_line';
	return 'open_water';
}

function innermost<Shape extends { points: LayoutPoint[] }>(shapes: Shape[], point: LayoutPoint) {
	const containing = shapes.filter((shape) => isPointInPolygon(point, shape.points));
	if (containing.length === 0) return null;
	return containing.reduce((smallest, shape) => (polygonAreaFraction(shape.points) < polygonAreaFraction(smallest.points) ? shape : smallest));
}

function isNearSnag(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint) {
	return layout.features.filter(isSnag).some((snag) => feetBetween(scale, point, snag.point) <= FeatureReach.SnagFeet);
}

function isNearIsland(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint) {
	return layout.islands.some((island) => feetToNearestEdge(scale, point, island.points) <= FeatureReach.IslandMarginFeet);
}

const AreaFeaturePriority = ['gravel_bar', 'lily_pads', 'weed_bed'] as const;

function areaFeatureAt(layout: LakeLayout, point: LayoutPoint): SwimFeature | null {
	const areas = layout.features.filter(isAreaFeature).filter((feature) => isPointInPolygon(point, feature.points));
	for (const kind of AreaFeaturePriority) if (areas.some((feature) => feature.kind === kind)) return kind;
	return null;
}

function isNearReeds(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint) {
	return layout.features.filter(isReedLine).some((reeds) => feetToNearestEdge(scale, point, reeds.points, false) <= FeatureReach.ReedLineFeet);
}
