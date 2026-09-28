import type { Vector3 } from 'three';

export interface Sightline {
	eye: Vector3;
	isOverview: boolean;
}

const Range = { BankViewMetres: 360, PlotMargin: 1.3 } as const;

export function shadowRangeOf(sightline: Sightline, wholePlotReach: number) {
	if (!sightline.isOverview) return Range.BankViewMetres;
	return sightline.eye.length() + wholePlotReach * Range.PlotMargin;
}
