import { FisheryClock } from '../simulation/elapsedDays';

export const HoursInADay = 24;

export const Daylight = { DawnStartsAt: 5, SunriseAt: 6.5, SunsetAt: 19.5, DuskEndsAt: 21 } as const;

export function hourOfFisheryDay(now: Date) {
	const throughTheDay = (now.getTime() % FisheryClock.RealMillisecondsPerFisheryDay) / FisheryClock.RealMillisecondsPerFisheryDay;
	return throughTheDay * HoursInADay;
}

export function isNightAt(hour: number) {
	return hour < Daylight.DawnStartsAt || hour >= Daylight.DuskEndsAt;
}

export function daylightAt(hour: number) {
	if (hour < Daylight.DawnStartsAt || hour >= Daylight.DuskEndsAt) return 0;
	if (hour < Daylight.SunriseAt) return eased((hour - Daylight.DawnStartsAt) / (Daylight.SunriseAt - Daylight.DawnStartsAt));
	if (hour < Daylight.SunsetAt) return 1;
	return eased((Daylight.DuskEndsAt - hour) / (Daylight.DuskEndsAt - Daylight.SunsetAt));
}

function eased(fraction: number) {
	return fraction * fraction * (3 - 2 * fraction);
}
