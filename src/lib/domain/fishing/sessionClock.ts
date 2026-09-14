export const FishingDay = {
	StartHour: 5,
	EndHour: 24,
	RealSecondsPerFishingHour: 22
} as const;

export const FishingHoursPerDay = FishingDay.EndHour - FishingDay.StartHour;

export function timeOfDayBiteFactor(hour: number) {
	const isDawn = hour < 8;
	const isDuskOrDark = hour >= 18;
	if (isDawn || isDuskOrDark) return 1.3;
	const isMidday = hour >= 11 && hour < 15;
	return isMidday ? 0.7 : 1;
}

export function formatFishingHour(hour: number) {
	const wholeHour = Math.floor(hour);
	const minutes = Math.floor((hour - wholeHour) * 60);
	return `${String(wholeHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
