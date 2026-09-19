import { layoutScaleFor } from '../layout/layoutScale';
import type { LakeLayout } from '../layout/layoutTypes';
import { GroundworksCatalogue, IslandWorks, WorkPrices } from './catalogue';
import { acresLabel, perimeterFeet, polygonAcres } from './draftFootprint';
import { FacilityCatalogue, isFacility, type FacilityProfile } from './facilities';
import { islandAcresFor, islandPolygonFor } from './islandTemplates';
import { priceDredge, priceReeds, priceShelf, priceShoreline, type MeasuredPrice } from './priceMeasuredWorks';
import type { WorkDraft } from './workKinds';

export interface WorkPrice {
	cost: number;
	days: number;
	disturbance: number;
	effects: string[];
}

export function priceDraft(draft: WorkDraft, layout: LakeLayout, plotAcres: number): WorkPrice {
	const priced = priceByKind(draft, layout, plotAcres);
	const disturbance = GroundworksCatalogue[draft.kind].disturbance + (priced.disturbance ?? 0);
	const siltEffect = disturbance > 0 ? [`Silt while built +${disturbance}`] : [];
	return { cost: priced.cost, days: priced.days, disturbance, effects: [...priced.effects, ...siltEffect] };
}

function priceByKind(draft: WorkDraft, layout: LakeLayout, plotAcres: number): MeasuredPrice {
	if (draft.kind === 'island') return priceIsland(draft, plotAcres);
	if (draft.kind === 'gravel_bar') return { ...WorkPrices.GravelBar, effects: [`Gravel bar of ${acresLabel(polygonAcres(draft.points, plotAcres))} at ${draft.depthFeet} ft`] };
	if (draft.kind === 'deepen') return { ...WorkPrices.Deepen, effects: [`Hole of ${acresLabel(polygonAcres(draft.points, plotAcres))} down to ${draft.depthFeet} ft`] };
	if (draft.kind === 'dredge') return priceDredge(draft, layout, plotAcres);
	if (draft.kind === 'margin_shelf') return priceShelf(draft, plotAcres);
	if (draft.kind === 'reed_bed') return priceReeds(draft, plotAcres);
	if (draft.kind === 'lily_pads') return { ...WorkPrices.LilyPads, effects: [`Lilies over ${acresLabel(polygonAcres(draft.points, plotAcres))} — a summer holding spot`] };
	if (draft.kind === 'snag') return { ...WorkPrices.Snag, effects: ['Big fish hold here; one hooked fish in ten finds it'] };
	if (draft.kind === 'reshape_shoreline') return priceShoreline(draft, layout, plotAcres);
	return priceFacility(draft);
}

function priceIsland(draft: Extract<WorkDraft, { kind: 'island' }>, plotAcres: number): MeasuredPrice {
	const polygon = islandPolygonFor(draft.size, draft.centre, draft.rotation, plotAcres);
	const marginFeet = Math.round(perimeterFeet(polygon, layoutScaleFor(plotAcres)));
	return { ...IslandWorks[draft.size], effects: [`Water lost ${acresLabel(islandAcresFor(draft.size))}`, `New margin ${marginFeet} ft`] };
}

function priceFacility(draft: WorkDraft): MeasuredPrice {
	if (!isFacility(draft.kind)) return priceSanctuary();
	const facility = FacilityCatalogue[draft.kind];
	return { cost: facility.cost, days: facility.days, effects: facilityEffects(facility) };
}

function priceSanctuary(): MeasuredPrice {
	const { cost, days, pegFreeFeet } = WorkPrices.Sanctuary;
	return { cost, days, effects: [`No peg within ${pegFreeFeet} ft of it; big fish favour the quiet bank`] };
}

function facilityEffects(facility: FacilityProfile) {
	const effects: string[] = [];
	if (facility.anglerFactor !== 1) effects.push(`Anglers ×${facility.anglerFactor}`);
	if (facility.takingsPerAngler > 0) effects.push(`+£${facility.takingsPerAngler} a head from every angler`);
	if (facility.payFactor !== 1) effects.push(`Anglers pay ×${facility.payFactor}`);
	if (facility.reputationPerDay > 0) effects.push(`Reputation +${facility.reputationPerDay} a day`);
	if (facility.multiDayFactor !== 1) effects.push(`Multi-day tickets ×${facility.multiDayFactor}`);
	if (facility.runningPerDay > 0) effects.push(`£${facility.runningPerDay} a day to run`);
	return effects;
}
