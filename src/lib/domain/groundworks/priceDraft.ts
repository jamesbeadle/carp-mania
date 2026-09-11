import { FacilityEffects, Prices } from '../economy';
import { layoutScaleFor } from '../layout/layoutScale';
import type { LakeLayout } from '../layout/layoutTypes';
import { GroundworksCatalogue, IslandWorks, WorkPrices } from './catalogue';
import { acresLabel, perimeterFeet, polygonAcres } from './draftFootprint';
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
	if (draft.kind === 'car_park') return { ...WorkPrices.CarPark, effects: [`Anglers ×${FacilityEffects.CarParkAnglerFactor}`] };
	if (draft.kind === 'lodge') return { ...WorkPrices.Lodge, effects: [`+£${FacilityEffects.LodgeTakingsPerAngler} a head from every angler`] };
	return { ...WorkPrices.Aerator, effects: ['No heatwave losses', `£${Prices.AeratorDailyRunning} a day to run`] };
}
