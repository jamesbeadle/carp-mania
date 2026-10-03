import type { CarParkSpec, CarParkSurface } from '../../layout/facilitySite';

export const CarParkPrices = {
	PerSpace: { gravel: 200, tarmac: 350 } satisfies Record<CarParkSurface, number>,
	Lighting: 1500,
	LightingPerDay: 4,
	BaseDays: 2,
	SpacesLaidPerDay: 10,
	ResurfaceDays: 3,
	SmallestJob: 250
} as const;

export const CarParkEffects = { TarmacPayFactor: 1.03, LightingMultiDayFactor: 1.1, VergeShare: 0.25, VergeReputationPerAngler: 0.02 } as const;

export function carParkCost(spec: CarParkSpec) {
	const lighting = spec.isLit ? CarParkPrices.Lighting : 0;
	return spec.spaces * CarParkPrices.PerSpace[spec.surface] + lighting;
}

export function carParkDays(spec: CarParkSpec) {
	return CarParkPrices.BaseDays + Math.ceil(spec.spaces / CarParkPrices.SpacesLaidPerDay);
}

export function carParkUpgradeCost(current: CarParkSpec, wanted: CarParkSpec) {
	return Math.max(CarParkPrices.SmallestJob, carParkCost(wanted) - carParkCost(current));
}

export function carParkUpgradeDays(current: CarParkSpec, wanted: CarParkSpec) {
	const added = wanted.spaces - current.spaces;
	const isResurfaced = wanted.surface !== current.surface;
	return CarParkPrices.BaseDays + Math.ceil(added / CarParkPrices.SpacesLaidPerDay) + (isResurfaced ? CarParkPrices.ResurfaceDays : 0);
}

export function whyCarParkUpgradeIsRefused(current: CarParkSpec, wanted: CarParkSpec): string | null {
	if (wanted.spaces < current.spaces) return `The car park keeps its ${current.spaces} spaces — it can only grow`;
	if (current.surface === 'tarmac' && wanted.surface === 'gravel') return 'Tarmac is not dug back up to gravel';
	if (current.isLit && !wanted.isLit) return 'The lights stay once they are up';
	const isUnchanged = wanted.spaces === current.spaces && wanted.surface === current.surface && wanted.isLit === current.isLit;
	return isUnchanged ? 'Nothing about the car park would change' : null;
}
