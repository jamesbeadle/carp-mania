import type { FacilitySite } from '../../layout/facilitySite';
import type { Facility } from '../../layout/layoutTypes';
import { FacilityCatalogue } from '../facilities';
import type { Plan } from '../plan';
import type { FacilityDraft, WorkDraft } from '../workKinds';
import { carParkOf } from './carParkOf';
import { whyCarParkUpgradeIsRefused } from './carParkPrice';
import { siteFitFailures } from './siteFit';
import { siteOfMove, siteOfPlacement, siteOfWork, type MoveDraft } from './siteOfWork';
import { pegPointsOf, siteOf, sitesOf } from './sitesOf';

type UpgradeDraft = Extract<WorkDraft, { kind: 'upgrade_car_park' }>;

function fitAmongNeighbours(plan: Plan, site: FacilitySite, leavingOut: Facility[]) {
	const standing = sitesOf(plan.layout, plan.plotAcres, plan.swims).filter((other) => !leavingOut.includes(other.facility));
	const coming = plan.worksInProgress.map((work) => siteOfWork(work, plan.layout)).filter((other): other is FacilitySite => other !== null);
	const neighbours = [...standing, ...coming].filter((other) => other.facility !== site.facility);
	return siteFitFailures(site, { layout: plan.layout, scale: plan.scale, pegs: pegPointsOf(plan.swims), neighbours });
}

export function placedFacilityFailures(plan: Plan, draft: FacilityDraft) {
	const replaced = FacilityCatalogue[draft.kind].replaces;
	return fitAmongNeighbours(plan, siteOfPlacement(draft), replaced ? [replaced] : []);
}

export function carParkUpgradeFailures(plan: Plan, draft: UpgradeDraft) {
	const current = carParkOf(plan.layout);
	const site = siteOf(sitesOf(plan.layout, plan.plotAcres, plan.swims), 'car_park');
	if (!current || !site) return ['There is no car park to upgrade yet'];
	if (isAlreadyBeingWorked(plan, 'car_park')) return ['The car park already has works under way'];
	const refusal = whyCarParkUpgradeIsRefused(current, draft.carPark);
	if (refusal) return [refusal];
	return fitAmongNeighbours(plan, { ...site, carPark: draft.carPark }, []);
}

export function facilityMoveFailures(plan: Plan, draft: MoveDraft) {
	const label = FacilityCatalogue[draft.facility].label.toLowerCase();
	if (!plan.layout.facilities.includes(draft.facility)) return [`There is no ${label} to move`];
	if (isAlreadyBeingWorked(plan, draft.facility)) return [`The ${label} already has works under way`];
	return fitAmongNeighbours(plan, siteOfMove(draft, plan.layout), []);
}

function isAlreadyBeingWorked(plan: Plan, facility: Facility) {
	return plan.worksInProgress.some((work) => siteOfWork(work, plan.layout)?.facility === facility);
}
