import { circle } from '../layout/classicLayout';
import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { SiteCatalogue } from './siteCatalogue';
import { oblong, polygon, swim, type SiteSwim } from './siteShapes';

const GravelPitOutline = polygon(
	[0.07, 0.36], [0.14, 0.2], [0.3, 0.1], [0.48, 0.15], [0.64, 0.08], [0.82, 0.14], [0.94, 0.3], [0.91, 0.52],
	[0.95, 0.72], [0.84, 0.89], [0.64, 0.86], [0.47, 0.93], [0.28, 0.88], [0.12, 0.78], [0.05, 0.58]
);

const BarDepthFeet = 4;
const HoleDepthFeet = 16;

const Bars: { id: string; centre: LayoutPoint; halfLength: number; angle: number }[] = [
	{ id: 'north-bar', centre: { x: 0.55, y: 0.3 }, halfLength: 0.12, angle: -0.2 },
	{ id: 'middle-bar', centre: { x: 0.57, y: 0.63 }, halfLength: 0.1, angle: 0.5 },
	{ id: 'back-bar', centre: { x: 0.8, y: 0.42 }, halfLength: 0.07, angle: 1.2 }
];
const BarHalfWidth = 0.02;

export function gravelPitLayout(): LakeLayout {
	const profile = SiteCatalogue.gravel_pit;
	const bars = Bars.map((bar) => ({ id: bar.id, points: oblong(bar.centre, bar.halfLength, BarHalfWidth, bar.angle) }));
	const hole = circle({ x: 0.22, y: 0.6 }, 0.08);
	return {
		version: 1,
		baseDepthFeet: profile.baseDepthFeet,
		baseBed: profile.baseBed,
		outline: GravelPitOutline,
		islands: [
			{ id: 'long-island', name: 'Long Island', points: oblong({ x: 0.36, y: 0.42 }, 0.1, 0.035, 0.3) },
			{ id: 'round-island', name: 'Round Island', points: circle({ x: 0.7, y: 0.62 }, 0.055) }
		],
		depthZones: [{ id: 'deep-hole', points: hole, depthFeet: HoleDepthFeet }, ...bars.map((bar) => ({ id: `${bar.id}-depth`, points: bar.points, depthFeet: BarDepthFeet }))],
		bedPatches: bars.map((bar) => ({ id: `${bar.id}-bed`, points: bar.points, bed: 'gravel' as const })),
		features: bars.map((bar) => ({ id: bar.id, kind: 'gravel_bar' as const, points: bar.points })),
		facilities: []
	};
}

export function gravelPitSwims(): SiteSwim[] {
	return [
		swim('The Point', 0.3, 0.083),
		swim('Long Island', 0.083, 0.27),
		swim('North Bar', 0.56, 0.095),
		swim('The Workings', 0.952, 0.41),
		swim('Round Island', 0.925, 0.82),
		swim('Deep Hole', 0.058, 0.69),
		swim('Car Park Swim', 0.555, 0.918)
	];
}
