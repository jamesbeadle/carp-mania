import { fractionOfHundred } from '../fraction';

export const StrikeWindow = { BaseSeconds: 4, ExtraSecondsAtFullWatercraft: 1.5 } as const;

export function strikeWindowFor(watercraft: number) {
	return StrikeWindow.BaseSeconds + StrikeWindow.ExtraSecondsAtFullWatercraft * fractionOfHundred(watercraft);
}
