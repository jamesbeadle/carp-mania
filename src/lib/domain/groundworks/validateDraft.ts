import type { LakeLayout } from '../layout/layoutTypes';
import { doPolygonsOverlap } from '../layout/pointInPolygon';
import type { Swim } from '../types';
import { GroundworksCatalogue, WorksInProgress } from './catalogue';
import { footprintOf, isAreaDraft, isBankDraft, isFacilityDraft } from './draftFootprint';
import { planFor, type Plan } from './plan';
import { validateArea, validateSnag } from './validateArea';
import { validateBankStretch, validateShoreline } from './validateBank';
import { validateIsland } from './validateIsland';
import { isEarthwork, type WorkDraft } from './workKinds';

export function validateDraft(layout: LakeLayout, plotAcres: number, swims: Swim[], worksInProgress: WorkDraft[], draft: WorkDraft): string[] {
	const plan = planFor(layout, plotAcres, swims, worksInProgress);
	return [...capacityFailures(plan, draft), ...shapeFailures(plan, draft), ...overlapFailures(plan, draft)];
}

function capacityFailures(plan: Plan, draft: WorkDraft): string[] {
	if (isFacilityDraft(draft)) return facilityFailures(plan, draft);
	const earthworksInProgress = plan.worksInProgress.filter((work) => isEarthwork(work.kind)).length;
	const isCrewBusy = isEarthwork(draft.kind) && earthworksInProgress >= WorksInProgress.MaximumEarthworks;
	return isCrewBusy ? [`${WorksInProgress.MaximumEarthworks} earthworks are already in progress — wait for one to finish`] : [];
}

function facilityFailures(plan: Plan, draft: WorkDraft): string[] {
	const label = GroundworksCatalogue[draft.kind].label.toLowerCase();
	if (plan.layout.facilities.some((facility) => facility === draft.kind)) return [`You already have a ${label}`];
	if (plan.worksInProgress.some((work) => work.kind === draft.kind)) return [`A ${label} is already being built`];
	return [];
}

function shapeFailures(plan: Plan, draft: WorkDraft): string[] {
	if (draft.kind === 'island') return validateIsland(plan, draft);
	if (draft.kind === 'snag') return validateSnag(plan, draft);
	if (draft.kind === 'reshape_shoreline') return validateShoreline(plan, draft);
	if (isAreaDraft(draft)) return validateArea(plan, draft);
	if (isBankDraft(draft)) return validateBankStretch(plan, draft);
	return [];
}

function overlapFailures(plan: Plan, draft: WorkDraft): string[] {
	if (draft.kind === 'reshape_shoreline' || isFacilityDraft(draft)) return [];
	const footprint = footprintOf(draft, plan.layout, plan.plotAcres);
	const isOverlapping = plan.worksInProgress
		.filter((work) => work.kind !== 'reshape_shoreline' && !isFacilityDraft(work))
		.map((work) => footprintOf(work, plan.layout, plan.plotAcres))
		.some((other) => doPolygonsOverlap(footprint.points, other.points));
	return isOverlapping ? ['That overlaps works already in progress'] : [];
}
