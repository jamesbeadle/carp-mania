import { PikeRules } from './economy';

const AcresPerPikeAllowance = 10;

export const PikeFoodOrder = { MinimumUnits: 1, MaximumUnits: 200 } as const;

export function sensiblePikeMaximumFor(waterAcres: number) {
	return Math.ceil((Number(waterAcres) / AcresPerPikeAllowance) * PikeRules.MaximumSensiblePerTenAcres);
}
