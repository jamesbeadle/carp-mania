import type { LakeLayout } from '../layout/layoutTypes';
import { doPolygonsOverlap } from '../layout/pointInPolygon';
import type { Swim } from '../types';
import { GroundworksCatalogue, WorksInProgress } from './catalogue';
import { isFacility, whyFacilityCannotBeBuilt } from './facilities';
import { footprintOf, isAreaDraft, isBankDraft } from './draftFootprint';
import { planFor, type Plan } from './plan';
import { validateArea, validateSnag } from './validateArea';
import { validateBankStretch, validateShoreline } from './validateBank';
import { validateIsland } from './validateIsland';
import { carParkUpgradeFailures, facilityMoveFailures, placedFacilityFailures } from './sites/siteWorkFailures';
import { isEarthwork, isFacilityDraft, isSiteWork, type WorkDraft } from './workKinds';

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

function builtOn(plan: Plan) {
	const { layout } = plan;
	return layout.facilities;
}

function facilityFailures(plan: Plan, draft: WorkDraft): string[] {
	const label = GroundworksCatalogue[draft.kind].label.toLowerCase();
	const built = builtOn(plan);
	if (built.some((facility) => facility === draft.kind)) return [`You already have a ${label}`];
	if (plan.worksInProgress.some((work) => work.kind === draft.kind)) return [`A ${label} is already being built`];
	const refusal = isFacility(draft.kind) ? whyFacilityCannotBeBuilt(built, draft.kind) : null;
	return refusal ? [refusal] : [];
}

function shapeFailures(plan: Plan, draft: WorkDraft): string[] {
	if (draft.kind === 'island') return validateIsland(plan, draft);
	if (draft.kind === 'snag') return validateSnag(plan, draft);
	if (draft.kind === 'reshape_shoreline') return validateShoreline(plan, draft);
	if (isAreaDraft(draft)) return validateArea(plan, draft);
	if (isBankDraft(draft)) return validateBankStretch(plan, draft);
	return siteFailures(plan, draft);
}

function siteFailures(plan: Plan, draft: WorkDraft): string[] {
	if (draft.kind === 'upgrade_car_park') return carParkUpgradeFailures(plan, draft);
	if (draft.kind === 'move_facility') return facilityMoveFailures(plan, draft);
	return isFacilityDraft(draft) ? placedFacilityFailures(plan, draft) : [];
}

function overlapFailures(plan: Plan, draft: WorkDraft): string[] {
	if (draft.kind === 'reshape_shoreline' || isSiteWork(draft)) return [];
	const footprint = footprintOf(draft, plan.layout, plan.plotAcres);
	const isOverlapping = plan.worksInProgress
		.filter((work) => work.kind !== 'reshape_shoreline' && !isSiteWork(work))
		.map((work) => footprintOf(work, plan.layout, plan.plotAcres))
		.some((other) => doPolygonsOverlap(footprint.points, other.points));
	return isOverlapping ? ['That overlaps works already in progress'] : [];
}
