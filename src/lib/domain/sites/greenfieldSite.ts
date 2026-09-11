import type { LakeLayout } from '../layout/layoutTypes';
import { GreenfieldWaterShareOfPlot, SiteCatalogue } from './siteCatalogue';
import { polygon, scaledToAreaFraction, swim, type SiteSwim } from './siteShapes';

const DrawnOutline = polygon(
	[0.1, 0.3], [0.18, 0.16], [0.36, 0.1], [0.6, 0.1], [0.82, 0.16], [0.92, 0.3], [0.93, 0.55], [0.88, 0.78],
	[0.72, 0.9], [0.45, 0.92], [0.22, 0.86], [0.09, 0.7], [0.06, 0.5]
);

export function greenfieldLayout(): LakeLayout {
	const profile = SiteCatalogue.greenfield;
	return {
		version: 1,
		baseDepthFeet: profile.baseDepthFeet,
		baseBed: profile.baseBed,
		outline: scaledToAreaFraction(DrawnOutline, GreenfieldWaterShareOfPlot),
		islands: [],
		depthZones: [],
		bedPatches: [],
		features: [],
		facilities: []
	};
}

export function greenfieldSwims(): SiteSwim[] {
	return [
		swim('The Inlet', 0.48, 0.078),
		swim('Spring Corner', 0.95, 0.42),
		swim('Hedge Side', 0.6, 0.935),
		swim('Long Bank', 0.05, 0.6),
		swim('The Gate', 0.115, 0.215)
	];
}
