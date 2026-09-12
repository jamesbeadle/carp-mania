import type { Swim } from '../types';
import { feetToNearestEdge } from './distanceToEdge';
import { feetBetween, type LayoutScale } from './layoutScale';
import type { LakeLayout, LayoutPoint } from './layoutTypes';
import { isInWater, pointFeetTowardsCentre } from './waterArea';

export const SwimRules = {
	AcresPerSwim: 0.6,
	MinimumSpacingFeet: 60,
	MaximumFeetFromWater: 40,
	CastInFrontFeet: 60,
	BuildCost: 350,
	BuildDays: 1,
	MoveCost: 150,
	RemoveCost: 100
} as const;

export function swimCapFor(waterAcres: number) {
	return Math.floor(waterAcres / SwimRules.AcresPerSwim) + 1;
}

export function swimPoint(swim: Pick<Swim, 'position_x' | 'position_y'>): LayoutPoint {
	return { x: Number(swim.position_x), y: Number(swim.position_y) };
}

export function isOnTheBank(layout: LakeLayout, scale: LayoutScale, point: LayoutPoint) {
	if (isInWater(layout, point)) return false;
	return feetToNearestEdge(scale, point, layout.outline) <= SwimRules.MaximumFeetFromWater;
}

export function isClearOfOtherSwims(scale: LayoutScale, point: LayoutPoint, others: Pick<Swim, 'position_x' | 'position_y'>[]) {
	return others.every((other) => feetBetween(scale, point, swimPoint(other)) >= SwimRules.MinimumSpacingFeet);
}

export function waterInFrontOfSwim(layout: LakeLayout, scale: LayoutScale, swim: Pick<Swim, 'position_x' | 'position_y'>): LayoutPoint {
	const peg = swimPoint(swim);
	for (let feet = SwimRules.CastInFrontFeet; feet <= scale.feetAcross; feet += 20) {
		const candidate = pointFeetTowardsCentre(layout, scale, peg, feet);
		if (isInWater(layout, candidate)) return candidate;
	}
	return pointFeetTowardsCentre(layout, scale, peg, scale.feetAcross / 2);
}
