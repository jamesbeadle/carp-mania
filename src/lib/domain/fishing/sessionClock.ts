import { hourOfDay } from './sessionWindow';

export const FishingDay = { RealSecondsPerFishingHour: 22 } as const;

const BiteHours = { DawnBefore: 8, DuskFrom: 18, MiddayFrom: 11, MiddayTo: 15 } as const;
const BiteFactor = { DawnAndDusk: 1.3, Midday: 0.78, Ordinary: 1 } as const;

export function timeOfDayBiteFactor(hour: number) {
	const clockHour = hourOfDay(hour);
	const isDawn = clockHour < BiteHours.DawnBefore;
	const isDuskOrDark = clockHour >= BiteHours.DuskFrom;
	if (isDawn || isDuskOrDark) return BiteFactor.DawnAndDusk;
	const isMidday = clockHour >= BiteHours.MiddayFrom && clockHour < BiteHours.MiddayTo;
	return isMidday ? BiteFactor.Midday : BiteFactor.Ordinary;
}

export function formatFishingHour(hour: number) {
	const clockHour = hourOfDay(hour);
	const wholeHour = Math.floor(clockHour);
	const minutes = Math.floor((clockHour - wholeHour) * 60);
	return `${String(wholeHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
