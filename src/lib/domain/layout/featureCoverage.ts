import { layoutScaleFor, type LayoutScale } from './layoutScale';
import { isSanctuary, type LakeLayout, type LayoutPoint } from './layoutTypes';
import { feetToNearestEdge } from './distanceToEdge';
import { featureAt } from './terrainAt';
import { isInWater } from './waterArea';

export const CoverageGrid = 48;
export const SanctuaryReachFeet = 40;
export const FullFeatureShare = 0.25;

export interface Coverage {
	sampled: number;
	featured: number;
	share: number;
}

export function featureCoverageOf(layout: LakeLayout, plotAcres: number): Coverage {
	const scale = layoutScaleFor(plotAcres);
	let sampled = 0;
	let featured = 0;
	for (let row = 0; row < CoverageGrid; row++) {
		for (let column = 0; column < CoverageGrid; column++) {
			const point = { x: (column + 0.5) / CoverageGrid, y: (row + 0.5) / CoverageGrid };
			if (!isInWater(layout, point)) continue;
			sampled += 1;
			if (isFeatured(layout, scale, point)) featured += 1;
		}
	}
	return { sampled, featured, share: sampled === 0 ? 0 : featured / sampled };
}

export function featureCoverageShare(layout: LakeLayout, plotAcres: number) {
	return featureCoverageOf(layout, plotAcres).share;
}

function isFeatured(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint) {
	if (featureAt(layout, scale, point) !== 'open_water') return true;
	return isAlongASanctuary(layout, scale, point);
}

export function isAlongASanctuary(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint) {
	return layout.features.filter(isSanctuary).some((stretch) => feetToNearestEdge(scale, point, stretch.points, false) <= SanctuaryReachFeet);
}
