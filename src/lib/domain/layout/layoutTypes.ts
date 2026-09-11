import type { BedType } from '../types';

export interface LayoutPoint {
	x: number;
	y: number;
}

export interface Island {
	id: string;
	name: string;
	points: LayoutPoint[];
}

export interface DepthZone {
	id: string;
	points: LayoutPoint[];
	depthFeet: number;
}

export interface BedPatch {
	id: string;
	points: LayoutPoint[];
	bed: BedType;
}

export type AreaFeatureKind = 'gravel_bar' | 'weed_bed' | 'lily_pads';

export interface AreaFeature {
	id: string;
	kind: AreaFeatureKind;
	points: LayoutPoint[];
}

export interface ReedLine {
	id: string;
	kind: 'reed_line';
	points: LayoutPoint[];
}

export interface Snag {
	id: string;
	kind: 'snag';
	point: LayoutPoint;
	name: string;
}

export type LakeFeature = AreaFeature | ReedLine | Snag;
export type LakeFeatureKind = LakeFeature['kind'];

export type Facility = 'car_park' | 'lodge' | 'aerator';
export const Facilities: Facility[] = ['car_park', 'lodge', 'aerator'];

export interface LakeLayout {
	version: 1;
	baseDepthFeet: number;
	baseBed: BedType;
	outline: LayoutPoint[];
	islands: Island[];
	depthZones: DepthZone[];
	bedPatches: BedPatch[];
	features: LakeFeature[];
	facilities: Facility[];
}

export function isSnag(feature: LakeFeature): feature is Snag {
	return feature.kind === 'snag';
}

export function isReedLine(feature: LakeFeature): feature is ReedLine {
	return feature.kind === 'reed_line';
}

export function isAreaFeature(feature: LakeFeature): feature is AreaFeature {
	return feature.kind === 'gravel_bar' || feature.kind === 'weed_bed' || feature.kind === 'lily_pads';
}

export function emptyLayout(baseBed: BedType, baseDepthFeet: number): LakeLayout {
	return { version: 1, baseDepthFeet, baseBed, outline: [], islands: [], depthZones: [], bedPatches: [], features: [], facilities: [] };
}
