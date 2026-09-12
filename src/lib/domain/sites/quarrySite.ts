import type { LakeLayout } from '../layout/layoutTypes';
import { SiteCatalogue } from './siteCatalogue';
import { polygon, swim, type SiteSwim } from './siteShapes';

const QuarryOutline = polygon(
	[0.1, 0.22], [0.4, 0.12], [0.72, 0.16], [0.9, 0.3], [0.92, 0.62], [0.78, 0.86], [0.42, 0.9], [0.14, 0.78], [0.08, 0.5]
);

export function quarryLayout(): LakeLayout {
	const profile = SiteCatalogue.quarry;
	return {
		version: 1,
		baseDepthFeet: profile.baseDepthFeet,
		baseBed: profile.baseBed,
		outline: QuarryOutline,
		islands: [],
		depthZones: [],
		bedPatches: [],
		features: [],
		facilities: []
	};
}

export function quarrySwims(): SiteSwim[] {
	return [swim('The Ledge', 0.56, 0.118), swim('Crane Corner', 0.935, 0.46), swim('The Face', 0.6, 0.905), swim('Spoil Heap', 0.085, 0.64)];
}
