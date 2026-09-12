const MillisecondsPerHour = 60 * 60 * 1000;

export const DayTicket = { ValidForHours: 2 } as const;

export function isDayTicketStillValid(visitedAt: string, now: Date) {
	const ageMilliseconds = now.getTime() - new Date(visitedAt).getTime();
	return ageMilliseconds <= DayTicket.ValidForHours * MillisecondsPerHour;
}
