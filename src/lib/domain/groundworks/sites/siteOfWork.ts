import type { FacilitySite } from '../../layout/facilitySite';
import type { LakeLayout } from '../../layout/layoutTypes';
import { isFacilityDraft, type FacilityDraft, type WorkDraft } from '../workKinds';
import { carParkOf } from './carParkOf';
import { StandardCarPark } from './carParkPlan';

export type MoveDraft = Extract<WorkDraft, { kind: 'move_facility' }>;

export function siteOfWork(work: WorkDraft, layout: LakeLayout): FacilitySite | null {
	if (work.kind === 'move_facility') return siteOfMove(work, layout);
	if (work.kind === 'upgrade_car_park') return storedCarParkSite(layout, work.carPark);
	if (!isFacilityDraft(work)) return null;
	return isPlaced(work) ? siteOfPlacement(work) : null;
}

function isPlaced(work: FacilityDraft) {
	return 'centre' in work && work.centre !== undefined;
}

export function siteOfPlacement(draft: FacilityDraft): FacilitySite {
	const carPark = draft.kind === 'car_park' ? (draft.carPark ?? StandardCarPark) : undefined;
	return { facility: draft.kind, centre: draft.centre, rotation: draft.rotation, carPark };
}

export function siteOfMove(draft: MoveDraft, layout: LakeLayout): FacilitySite {
	const carPark = draft.facility === 'car_park' ? (carParkOf(layout) ?? StandardCarPark) : undefined;
	return { facility: draft.facility, centre: draft.centre, rotation: draft.rotation, carPark };
}

function storedCarParkSite(layout: LakeLayout, carPark: FacilitySite['carPark']): FacilitySite | null {
	const site = (layout.sites ?? []).find((candidate) => candidate.facility === 'car_park');
	return site ? { ...site, carPark } : null;
}
