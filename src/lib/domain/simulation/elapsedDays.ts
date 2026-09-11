export const FisheryClock = {
	RealMillisecondsPerFisheryDay: 60 * 60 * 1000,
	MaximumDaysSimulatedPerVisit: 30
} as const;

export function fisheryDaysElapsedSince(simulatedUntil: string, now: Date) {
	const elapsedMilliseconds = now.getTime() - new Date(simulatedUntil).getTime();
	const wholeDays = Math.floor(elapsedMilliseconds / FisheryClock.RealMillisecondsPerFisheryDay);
	return Math.min(FisheryClock.MaximumDaysSimulatedPerVisit, Math.max(0, wholeDays));
}

export function simulatedUntilAfter(simulatedUntil: string, daysSimulated: number) {
	const advanced = new Date(simulatedUntil).getTime() + daysSimulated * FisheryClock.RealMillisecondsPerFisheryDay;
	return new Date(advanced).toISOString();
}
