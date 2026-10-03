import type { LakeLayout } from '../../layout/layoutTypes';
import { carParkOf } from './carParkOf';
import { vergeCapacityOf } from './carParkEffects';
import { CarParkEffects, CarParkPrices } from './carParkPrice';

const NoChange = 1;
const NothingToRun = 0;
const NobodyOnTheVerge = 0;

export function carParkPayFactor(layout: LakeLayout) {
	const spec = carParkOf(layout);
	return spec?.surface === 'tarmac' ? CarParkEffects.TarmacPayFactor : NoChange;
}

export function carParkMultiDayFactor(layout: LakeLayout) {
	const spec = carParkOf(layout);
	return spec?.isLit ? CarParkEffects.LightingMultiDayFactor : NoChange;
}

export function carParkRunningPerDay(layout: LakeLayout) {
	const spec = carParkOf(layout);
	return spec?.isLit ? CarParkPrices.LightingPerDay : NothingToRun;
}

export function parkingCapacityOf(layout: LakeLayout) {
	const spec = carParkOf(layout);
	return spec ? vergeCapacityOf(spec) : Number.POSITIVE_INFINITY;
}

export function anglersOnTheVerge(layout: LakeLayout, anglers: number) {
	const spec = carParkOf(layout);
	return spec ? Math.max(NobodyOnTheVerge, anglers - spec.spaces) : NobodyOnTheVerge;
}

export function vergeReputationCost(anglersOnTheVerge: number) {
	return anglersOnTheVerge * CarParkEffects.VergeReputationPerAngler;
}
