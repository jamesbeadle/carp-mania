import type { CarParkSpec } from '../../layout/facilitySite';
import { FacilityCatalogue } from '../facilities';
import { CarParkEffects, CarParkPrices } from './carParkPrice';

const SurfaceWords = { gravel: 'gravel', tarmac: 'tarmac' } as const;

export function carParkSummary(spec: CarParkSpec) {
	const lights = spec.isLit ? ', lit' : '';
	return `${spec.spaces} spaces, ${SurfaceWords[spec.surface]}${lights}`;
}

export function vergeCapacityOf(spec: CarParkSpec) {
	return Math.floor(spec.spaces * (1 + CarParkEffects.VergeShare));
}

export function carParkEffects(spec: CarParkSpec): string[] {
	const effects = [carParkSummary(spec), `Anglers ×${FacilityCatalogue.car_park.anglerFactor}`, `Parks ${spec.spaces} anglers a day; up to ${vergeCapacityOf(spec)} if they use the verge, which the regulars hate`];
	if (spec.surface === 'tarmac') effects.push(`Anglers pay ×${CarParkEffects.TarmacPayFactor}`);
	if (spec.isLit) effects.push(`Multi-day tickets ×${CarParkEffects.LightingMultiDayFactor}`, `£${CarParkPrices.LightingPerDay} a day to light`);
	return effects;
}
