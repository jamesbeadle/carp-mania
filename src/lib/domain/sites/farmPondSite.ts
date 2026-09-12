import type { LakeLayout } from '../layout/layoutTypes';
import { SiteCatalogue } from './siteCatalogue';
import { polygon, swim, type SiteSwim } from './siteShapes';

const FarmPondOutline = polygon(
	[0.1, 0.44], [0.2, 0.22], [0.42, 0.12], [0.64, 0.14], [0.84, 0.28], [0.9, 0.52], [0.8, 0.78], [0.58, 0.9], [0.34, 0.86], [0.14, 0.7]
);

export function farmPondLayout(): LakeLayout {
	const profile = SiteCatalogue.farm_pond;
	return {
		version: 1,
		baseDepthFeet: profile.baseDepthFeet,
		baseBed: profile.baseBed,
		outline: FarmPondOutline,
		islands: [],
		depthZones: [],
		bedPatches: [],
		features: [],
		facilities: []
	};
}

export function farmPondSwims(): SiteSwim[] {
	return [swim('Gateway', 0.53, 0.105), swim('The Oak', 0.895, 0.395), swim('Cattle Drink', 0.46, 0.905), swim('Far Bank', 0.095, 0.57)];
}
