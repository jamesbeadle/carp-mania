import { FacilityCatalogue } from '$lib/domain/groundworks/facilities';
import { carParkOf } from '$lib/domain/groundworks/sites/carParkOf';
import { CarParkRules, StandardCarPark } from '$lib/domain/groundworks/sites/carParkPlan';
import { defaultSiteFor } from '$lib/domain/groundworks/sites/defaultSite';
import type { MoveDraft } from '$lib/domain/groundworks/sites/siteOfWork';
import { pegPointsOf, siteOf, sitesOf } from '$lib/domain/groundworks/sites/sitesOf';
import { isFacilityDraft, type FacilityDraft, type WorkDraft } from '$lib/domain/groundworks/workKinds';
import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import type { Facility } from '$lib/domain/layout/layoutTypes';
import type { BuilderState } from '../builderState.svelte';
import type { ToolContext } from '../tools/toolHandlers';

export type PlacementDraft = FacilityDraft | MoveDraft;

const SpacesAddedByAnUpgrade = 10;

export function isPlacementDraft(draft: WorkDraft | null): draft is PlacementDraft {
	return draft !== null && (isFacilityDraft(draft) || draft.kind === 'move_facility');
}

export function builtSitesOf(context: ToolContext) {
	return sitesOf(context.layout, context.plotAcres, context.swims);
}

export function startPlacing(builder: BuilderState, facility: Facility, context: ToolContext) {
	const sites = builtSitesOf(context);
	const replaced = FacilityCatalogue[facility].replaces;
	const surroundings = { layout: context.layout, scale: layoutScaleFor(context.plotAcres), pegs: pegPointsOf(context.swims), neighbours: sites };
	const site = (replaced ? siteOf(sites, replaced) : null) ?? defaultSiteFor(facility, 0, surroundings);
	const carPark = facility === 'car_park' ? { carPark: StandardCarPark } : {};
	builder.place({ kind: facility, centre: site.centre, rotation: site.rotation, ...carPark } as FacilityDraft);
}

export function startMoving(builder: BuilderState, facility: Facility, context: ToolContext) {
	const site = siteOf(builtSitesOf(context), facility);
	if (site) builder.place({ kind: 'move_facility', facility, centre: site.centre, rotation: site.rotation });
}

export function startUpgradingTheCarPark(builder: BuilderState, context: ToolContext) {
	const current = carParkOf(context.layout);
	if (!current) return;
	const spaces = Math.min(CarParkRules.MaximumSpaces, current.spaces + SpacesAddedByAnUpgrade);
	builder.place({ kind: 'upgrade_car_park', carPark: { ...current, spaces } });
}
