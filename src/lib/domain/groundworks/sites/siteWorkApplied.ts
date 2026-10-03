import type { FacilitySite } from '../../layout/facilitySite';
import type { Facility, LakeLayout } from '../../layout/layoutTypes';
import type { Swim } from '../../types';
import { builtAfter, FacilityCatalogue } from '../facilities';
import { isFacilityDraft, type FacilityDraft, type WorkDraft } from '../workKinds';
import { siteOfMove, siteOfWork } from './siteOfWork';
import { sitesOf } from './sitesOf';

type SwimPosition = Pick<Swim, 'position_x' | 'position_y'>;

export function layoutAfterSiteWork(layout: LakeLayout, draft: WorkDraft, plotAcres: number, swims: SwimPosition[]): LakeLayout {
	const settled: LakeLayout = { ...layout, sites: sitesOf(layout, plotAcres, swims) };
	if (draft.kind === 'move_facility') return withSite(settled, siteOfMove(draft, settled), []);
	if (draft.kind === 'upgrade_car_park') return withCarParkSpec(settled, draft.carPark);
	return isFacilityDraft(draft) ? withBuiltFacility(settled, draft, plotAcres, swims) : settled;
}

function withBuiltFacility(layout: LakeLayout, draft: FacilityDraft, plotAcres: number, swims: SwimPosition[]): LakeLayout {
	if (layout.facilities.includes(draft.kind)) return layout;
	const replaced = FacilityCatalogue[draft.kind].replaces;
	const built: LakeLayout = { ...layout, facilities: builtAfter(layout.facilities, draft.kind) };
	const site = siteOfWork(draft, layout);
	if (site) return withSite(built, site, replaced ? [replaced] : []);
	return { ...built, sites: sitesOf({ ...built, sites: withoutFacilities(layout.sites ?? [], replaced ? [replaced] : []) }, plotAcres, swims) };
}

function withSite(layout: LakeLayout, site: FacilitySite, replaced: Facility[]): LakeLayout {
	const others = withoutFacilities(layout.sites ?? [], [...replaced, site.facility]);
	return { ...layout, sites: [...others, site] };
}

function withCarParkSpec(layout: LakeLayout, carPark: FacilitySite['carPark']): LakeLayout {
	return { ...layout, sites: (layout.sites ?? []).map((site) => (site.facility === 'car_park' ? { ...site, carPark } : site)) };
}

function withoutFacilities(sites: FacilitySite[], facilities: Facility[]) {
	return sites.filter((site) => !facilities.includes(site.facility));
}
