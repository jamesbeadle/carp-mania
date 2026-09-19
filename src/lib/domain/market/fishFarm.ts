export const FarmDelivery = { FisheryDays: 1, RealHoursPerFisheryWeek: 7 } as const;
export const FarmFishCondition = { Minimum: 80, Maximum: 90 } as const;

const FarmFishAge = { BaseYears: 2, PoundsPerYear: 4 } as const;
const MillisecondsPerHour = 60 * 60 * 1000;

export function fisheryWeekNumber(now: Date) {
	return Math.floor(now.getTime() / (FarmDelivery.RealHoursPerFisheryWeek * MillisecondsPerHour));
}

export function fisheryWeekStart(now: Date) {
	return new Date(fisheryWeekNumber(now) * FarmDelivery.RealHoursPerFisheryWeek * MillisecondsPerHour);
}

export function ageForFarmFish(weightLb: number) {
	return Math.round(FarmFishAge.BaseYears + weightLb / FarmFishAge.PoundsPerYear);
}
