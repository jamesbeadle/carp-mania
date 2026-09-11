import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { waterAcres } from '../layout/waterArea';
import { IslandRules, WorkPrices } from './catalogue';
import { polygonAcres } from './draftFootprint';

export interface DredgingEffect {
	acres: number;
	siltCleared: number;
	fertilityLost: number;
}

export function dredgingEffectOf(points: LayoutPoint[], layout: LakeLayout, plotAcres: number): DredgingEffect {
	const acres = polygonAcres(points, plotAcres);
	const share = acres / Math.max(IslandRules.MinimumWaterAcres, waterAcres(layout, plotAcres));
	return { acres, siltCleared: WorkPrices.Dredge.siltCleared * share, fertilityLost: WorkPrices.Dredge.fertilityLost * share };
}
