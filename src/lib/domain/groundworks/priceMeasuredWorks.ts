import { layoutScaleFor } from '../layout/layoutScale';
import type { LakeLayout } from '../layout/layoutTypes';
import { polygonCentroid } from '../layout/polygonArea';
import { depthAt } from '../layout/terrainAt';
import { waterAcres } from '../layout/waterArea';
import { WorkPrices } from './catalogue';
import { acresLabel, polylineFeet } from './draftFootprint';
import { dredgingEffectOf } from './dredging';
import { shorelineChangeFor } from './shorelineChange';
import type { WorkDraft } from './workKinds';

export interface MeasuredPrice {
	cost: number;
	days: number;
	disturbance?: number;
	effects: string[];
}

const FeetPerShelfUnit = 100;
const FeetPerReedUnit = 50;
const FeetPerShorelineUnit = 100;

export function priceDredge(draft: Extract<WorkDraft, { kind: 'dredge' }>, layout: LakeLayout, plotAcres: number): MeasuredPrice {
	const dredging = dredgingEffectOf(draft.points, layout, plotAcres);
	const units = Math.ceil(dredging.acres);
	const depthNow = depthAt(layout, polygonCentroid(draft.points));
	return {
		cost: units * WorkPrices.Dredge.costPerAcre,
		days: units * WorkPrices.Dredge.daysPerAcre,
		effects: [
			`Silt −${Math.round(dredging.siltCleared)}`,
			`Fertility −${Math.round(dredging.fertilityLost)}`,
			`${depthNow} → ${depthNow + WorkPrices.Dredge.depthGainedFeet} ft over ${acresLabel(dredging.acres)}`
		]
	};
}

export function priceShelf(draft: Extract<WorkDraft, { kind: 'margin_shelf' }>, plotAcres: number): MeasuredPrice {
	const feet = polylineFeet(draft.points, layoutScaleFor(plotAcres));
	const units = Math.ceil(feet / FeetPerShelfUnit);
	return {
		cost: units * WorkPrices.MarginShelf.costPerHundredFeet,
		days: units * WorkPrices.MarginShelf.daysPerHundredFeet,
		effects: [`Shelf ${Math.round(feet)} ft long, ${draft.bed} at ${WorkPrices.MarginShelf.depthFeet} ft`]
	};
}

export function priceReeds(draft: Extract<WorkDraft, { kind: 'reed_bed' }>, plotAcres: number): MeasuredPrice {
	const feet = polylineFeet(draft.points, layoutScaleFor(plotAcres));
	const units = Math.ceil(feet / FeetPerReedUnit);
	return {
		cost: units * WorkPrices.ReedBed.costPerFiftyFeet,
		days: WorkPrices.ReedBed.days,
		effects: [`Reeds along ${Math.round(feet)} ft`, `Weed +${WorkPrices.ReedBed.weedGained}`]
	};
}

export function priceShoreline(draft: Extract<WorkDraft, { kind: 'reshape_shoreline' }>, layout: LakeLayout, plotAcres: number): MeasuredPrice {
	const change = shorelineChangeFor(layout.outline, draft.outline, layout, plotAcres);
	const movedUnits = Math.ceil(change.feetMoved / FeetPerShorelineUnit);
	const dugUnits = Math.ceil(change.acresAdded);
	const shoreline = WorkPrices.Shoreline;
	const before = waterAcres(layout, plotAcres);
	const after = waterAcres({ ...layout, outline: draft.outline }, plotAcres);
	return {
		cost: movedUnits * shoreline.costPerHundredFeetMoved + dugUnits * shoreline.digCostPerAcreAdded,
		days: movedUnits * shoreline.daysPerHundredFeetMoved + dugUnits * shoreline.digDaysPerAcreAdded,
		disturbance: dugUnits * shoreline.disturbancePerAcreAdded,
		effects: [`Bank moved ${change.feetMoved} ft`, after >= before ? `Water gained ${acresLabel(after - before)}` : `Water lost ${acresLabel(before - after)}`]
	};
}
