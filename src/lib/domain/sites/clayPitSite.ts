import { circle } from '../layout/classicLayout';
import type { LakeLayout } from '../layout/layoutTypes';
import { SiteCatalogue } from './siteCatalogue';
import { polygon, swim, type SiteSwim } from './siteShapes';

const ClayPitOutline = polygon(
	[0.1, 0.3], [0.2, 0.16], [0.4, 0.1], [0.62, 0.12], [0.84, 0.18], [0.93, 0.36], [0.92, 0.6], [0.86, 0.82],
	[0.66, 0.9], [0.44, 0.9], [0.24, 0.84], [0.1, 0.7], [0.06, 0.5]
);

export function clayPitLayout(): LakeLayout {
	const profile = SiteCatalogue.clay_pit;
	return {
		version: 1,
		baseDepthFeet: profile.baseDepthFeet,
		baseBed: profile.baseBed,
		outline: ClayPitOutline,
		islands: [{ id: 'brick-island', name: 'Brick Island', points: circle({ x: 0.58, y: 0.5 }, 0.06) }],
		depthZones: [],
		bedPatches: [],
		features: [],
		facilities: []
	};
}

export function clayPitSwims(): SiteSwim[] {
	return [
		swim('The Kiln', 0.51, 0.088),
		swim('Brick Island', 0.95, 0.48),
		swim('Clay Bank', 0.77, 0.885),
		swim('Tramway', 0.335, 0.895),
		swim('The Drain', 0.055, 0.6),
		swim('Willow Corner', 0.13, 0.215)
	];
}
