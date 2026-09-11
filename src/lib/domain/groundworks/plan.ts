import { layoutScaleFor, type LayoutScale } from '../layout/layoutScale';
import type { LakeLayout } from '../layout/layoutTypes';
import type { Swim } from '../types';
import type { WorkDraft } from './workKinds';

export interface Plan {
	layout: LakeLayout;
	plotAcres: number;
	scale: LayoutScale;
	swims: Swim[];
	worksInProgress: WorkDraft[];
}

export function planFor(layout: LakeLayout, plotAcres: number, swims: Swim[], worksInProgress: WorkDraft[]): Plan {
	return { layout, plotAcres, scale: layoutScaleFor(plotAcres), swims, worksInProgress };
}
