import { PikeRules } from './economy';
import type { Lake } from './types';

const AcresPerPikeAllowance = 10;

export const PikeFoodOrder = { MinimumUnits: 1, MaximumUnits: 200 } as const;

type StockedWater = Pick<Lake, 'acres' | 'pike_count'>;

export function sensiblePikeMaximumFor(waterAcres: number) {
	return Math.ceil((Number(waterAcres) / AcresPerPikeAllowance) * PikeRules.MaximumSensiblePerTenAcres);
}

export function roomForMorePike(water: StockedWater) {
	return Math.max(0, sensiblePikeMaximumFor(water.acres) - water.pike_count);
}

export function whyNoRoomForPike(water: StockedWater): string | null {
	const most = sensiblePikeMaximumFor(water.acres);
	if (water.pike_count < most) return null;
	if (water.pike_count === most) return `This water sensibly holds ${most} pike and has them all.`;
	return `${water.pike_count} pike is more than the ${most} this water sensibly holds. Stop feeding them and they will thin out.`;
}
