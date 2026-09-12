import { FisheryClock } from '../simulation/elapsedDays';

export const FisheryYear = { Days: 365, SouthernShiftDays: 182, MidwinterDay: 15 } as const;

export type Hemisphere = 'northern' | 'southern';
export type SeasonName = 'winter' | 'spring' | 'summer' | 'autumn';

export function fisheryDayNumber(now: Date) {
	return Math.floor(now.getTime() / FisheryClock.RealMillisecondsPerFisheryDay);
}

export function dayOfFisheryYear(now: Date) {
	return fisheryDayNumber(now) % FisheryYear.Days;
}

export function isWorldNewYear(dayBefore: Date, dayAfter: Date) {
	return dayOfFisheryYear(dayAfter) < dayOfFisheryYear(dayBefore);
}

export function hemisphereOf(latitude: number | null): Hemisphere {
	return latitude !== null && latitude < 0 ? 'southern' : 'northern';
}

export function seasonFraction(dayOfYear: number, hemisphere: Hemisphere) {
	const shift = hemisphere === 'southern' ? FisheryYear.SouthernShiftDays : 0;
	const daysSinceMidwinter = (dayOfYear - FisheryYear.MidwinterDay + shift + FisheryYear.Days) % FisheryYear.Days;
	return (1 - Math.cos((daysSinceMidwinter / FisheryYear.Days) * Math.PI * 2)) / 2;
}

export function seasonNameFor(dayOfYear: number, hemisphere: Hemisphere): SeasonName {
	const shift = hemisphere === 'southern' ? FisheryYear.SouthernShiftDays : 0;
	const daysSinceMidwinter = (dayOfYear - FisheryYear.MidwinterDay + shift + FisheryYear.Days) % FisheryYear.Days;
	const quarter = Math.floor((daysSinceMidwinter / FisheryYear.Days) * 4 + 0.5) % 4;
	return (['winter', 'spring', 'summer', 'autumn'] as const)[quarter];
}
