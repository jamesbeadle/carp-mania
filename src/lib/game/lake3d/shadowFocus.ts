import { Vector3 } from 'three';

export interface Sightline {
	eye: Vector3;
	focus: Vector3;
	isOverview: boolean;
}

export interface ShadowFocus {
	centre: Vector3;
	reach: number;
}

const Near = { ReachPerMetreAway: 1.15, LeastReach: 24, MostReach: 80, AheadShareOfReach: 0.65 } as const;

export function shadowFocusOf(sightline: Sightline, wholePlotReach: number): ShadowFocus {
	if (sightline.isOverview) return { centre: new Vector3(), reach: wholePlotReach };
	const { eye, focus } = sightline;
	const ahead = new Vector3(focus.x - eye.x, 0, focus.z - eye.z);
	const metresAway = ahead.length();
	const reach = Math.min(Near.MostReach, Math.max(Near.LeastReach, metresAway * Near.ReachPerMetreAway));
	const centre = new Vector3(eye.x, 0, eye.z).addScaledVector(ahead.normalize(), Math.min(metresAway, reach * Near.AheadShareOfReach));
	return { centre, reach };
}
