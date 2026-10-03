import type { CarParkSpec } from '../../layout/facilitySite';
import type { Facility, LakeLayout } from '../../layout/layoutTypes';
import { FacilityCatalogue } from '../facilities';
import type { MeasuredPrice } from '../priceMeasuredWorks';
import type { WorkDraft } from '../workKinds';
import { carParkOf } from './carParkOf';
import { StandardCarPark } from './carParkPlan';
import { carParkCost, carParkDays, carParkUpgradeCost, carParkUpgradeDays } from './carParkPrice';
import { carParkEffects } from './carParkEffects';
import type { MoveDraft } from './siteOfWork';

type UpgradeDraft = Extract<WorkDraft, { kind: 'upgrade_car_park' }>;

const Moving = { ShareOfBuildCost: 0.4, ShareOfBuildDays: 0.5, FewestDays: 1 } as const;

export function priceCarPark(spec: CarParkSpec): MeasuredPrice {
	return { cost: carParkCost(spec), days: carParkDays(spec), effects: carParkEffects(spec) };
}

export function priceCarParkUpgrade(draft: UpgradeDraft, layout: LakeLayout): MeasuredPrice {
	const current = carParkOf(layout) ?? StandardCarPark;
	return { cost: carParkUpgradeCost(current, draft.carPark), days: carParkUpgradeDays(current, draft.carPark), effects: carParkEffects(draft.carPark) };
}

export function priceFacilityMove(draft: MoveDraft, layout: LakeLayout): MeasuredPrice {
	const built = buildPriceOf(draft.facility, layout);
	const cost = Math.round(built.cost * Moving.ShareOfBuildCost);
	const days = Math.max(Moving.FewestDays, Math.ceil(built.days * Moving.ShareOfBuildDays));
	return { cost, days, effects: [`The ${FacilityCatalogue[draft.facility].label.toLowerCase()} is taken down and put up again here`] };
}

function buildPriceOf(facility: Facility, layout: LakeLayout) {
	if (facility === 'car_park') return { cost: carParkCost(carParkOf(layout) ?? StandardCarPark), days: carParkDays(carParkOf(layout) ?? StandardCarPark) };
	const profile = FacilityCatalogue[facility];
	return { cost: profile.cost, days: profile.days };
}
