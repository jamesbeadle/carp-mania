import type { CarParkSpec } from '$lib/domain/layout/facilitySite';

const ShareParkedOnATypicalDay = 0.6;

export function carsOnATypicalDay(spec: CarParkSpec) {
	return Math.ceil(spec.spaces * ShareParkedOnATypicalDay);
}
