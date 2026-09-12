import { circle } from '../layout/classicLayout';
import type { LakeLayout } from '../layout/layoutTypes';
import { SiteCatalogue } from './siteCatalogue';
import { oblong, polygon, swim, type SiteSwim } from './siteShapes';

const EstateOutline = polygon(
	[0.1, 0.42], [0.16, 0.24], [0.3, 0.13], [0.5, 0.1], [0.7, 0.13], [0.88, 0.2], [0.88, 0.8], [0.7, 0.88],
	[0.5, 0.91], [0.3, 0.86], [0.15, 0.72], [0.07, 0.58]
);

const DamDepthFeet = 9;

export function estateLakeLayout(): LakeLayout {
	const profile = SiteCatalogue.estate_lake;
	return {
		version: 1,
		baseDepthFeet: profile.baseDepthFeet,
		baseBed: profile.baseBed,
		outline: EstateOutline,
		islands: [{ id: 'heron-island', name: 'Heron Island', points: oblong({ x: 0.45, y: 0.5 }, 0.08, 0.04, -0.4) }],
		depthZones: [{ id: 'the-dam-depth', points: polygon([0.74, 0.24], [0.86, 0.22], [0.86, 0.78], [0.74, 0.76]), depthFeet: DamDepthFeet }],
		bedPatches: [],
		features: [
			{ id: 'north-reeds', kind: 'reed_line', points: polygon([0.2, 0.27], [0.26, 0.21], [0.32, 0.17]) },
			{ id: 'south-reeds', kind: 'reed_line', points: polygon([0.32, 0.83], [0.4, 0.855], [0.5, 0.875]) },
			{ id: 'outfall-reeds', kind: 'reed_line', points: polygon([0.72, 0.85], [0.8, 0.82]) },
			{ id: 'lily-bay', kind: 'lily_pads', points: circle({ x: 0.24, y: 0.62 }, 0.06) },
			{ id: 'top-pads', kind: 'lily_pads', points: circle({ x: 0.62, y: 0.25 }, 0.05) }
		],
		facilities: []
	};
}

export function estateLakeSwims(): SiteSwim[] {
	return [
		swim('The Dam', 0.905, 0.5),
		swim('Boathouse', 0.795, 0.14),
		swim('Top End', 0.6, 0.092),
		swim('Lily Bay', 0.08, 0.66),
		swim('The Reeds', 0.215, 0.165),
		swim('Island Point', 0.205, 0.805),
		swim('Willow Swim', 0.4, 0.91),
		swim('The Outfall', 0.8, 0.865)
	];
}
