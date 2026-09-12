import type { Carp, SwimFeature } from '../types';
import { isAreaFeature, isReedLine, isSnag, type LakeLayout, type LayoutPoint } from './layoutTypes';
import { isPointInPolygon } from './pointInPolygon';
import type { Terrain } from './terrainAt';

export type FavouriteSpot = { kind: 'feature'; feature: SwimFeature } | { kind: 'depth_zone'; zoneId: string };

export const FavouriteSpotBiteBonus = 1.3;

export function featuresPresent(layout: LakeLayout): SwimFeature[] {
	const present: SwimFeature[] = ['open_water'];
	if (layout.islands.length > 0) present.push('island_margin');
	if (layout.features.some(isSnag)) present.push('snag');
	if (layout.features.some(isReedLine)) present.push('reed_line');
	for (const kind of ['gravel_bar', 'weed_bed', 'lily_pads'] as const) {
		if (layout.features.some((feature) => isAreaFeature(feature) && feature.kind === kind)) present.push(kind);
	}
	return present;
}

export function favouriteSpotOf(carp: Pick<Carp, 'id'>, layout: LakeLayout, isWinter: boolean): FavouriteSpot {
	const deepest = deepestZoneId(layout);
	if (isWinter && deepest) return { kind: 'depth_zone', zoneId: deepest };
	const present = featuresPresent(layout);
	return { kind: 'feature', feature: present[stableHash(carp.id) % present.length] };
}

export function isCastAtFavourite(favourite: FavouriteSpot, terrain: Terrain, castPoint: LayoutPoint, layout: LakeLayout) {
	if (favourite.kind === 'feature') return terrain.feature === favourite.feature;
	const zone = layout.depthZones.find((candidate) => candidate.id === favourite.zoneId);
	return zone !== undefined && isPointInPolygon(castPoint, zone.points);
}

export function deepestZoneId(layout: LakeLayout) {
	if (layout.depthZones.length === 0) return null;
	return layout.depthZones.reduce((deepest, zone) => (zone.depthFeet > deepest.depthFeet ? zone : deepest)).id;
}

export function stableHash(text: string) {
	let hash = 2166136261;
	for (let index = 0; index < text.length; index++) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return hash;
}
