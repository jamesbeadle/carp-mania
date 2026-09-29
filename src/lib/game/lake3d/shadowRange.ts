import { Vector3 } from 'three';

export interface Sightline {
	eye: Vector3;
	focus: Vector3;
	isOverview: boolean;
}

export interface ShadowBox {
	centre: Vector3;
	halfWidth: number;
}

const Range = { BankViewMetres: 360, PlotMargin: 1.3 } as const;
const Box = { BankHalfWidthMetres: 62, AheadOfEyeMetres: 42, PlotShare: 1 } as const;

export function shadowRangeOf(sightline: Sightline, wholePlotReach: number) {
	if (!sightline.isOverview) return Range.BankViewMetres;
	return sightline.eye.length() + wholePlotReach * Range.PlotMargin;
}

export function shadowBoxOf(sightline: Sightline, wholePlotReach: number): ShadowBox {
	const { eye, focus } = sightline;
	if (sightline.isOverview) return { centre: new Vector3(focus.x, 0, focus.z), halfWidth: wholePlotReach * Box.PlotShare };
	const ahead = new Vector3(focus.x - eye.x, 0, focus.z - eye.z);
	const aheadMetres = Math.min(Box.AheadOfEyeMetres, ahead.length());
	const centre = new Vector3(eye.x, 0, eye.z).addScaledVector(ahead.normalize(), aheadMetres);
	return { centre, halfWidth: Box.BankHalfWidthMetres };
}
