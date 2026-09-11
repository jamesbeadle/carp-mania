const MillisecondsPerMinute = 60 * 1000;
const MinutesPerHour = 60;
const HoursPerDay = 24;

export const TimeLeftWords = { Ending: 'ending' } as const;

export function timeLeft(endsAt: string | Date, now: Date) {
	const minutesLeft = Math.floor((new Date(endsAt).getTime() - now.getTime()) / MillisecondsPerMinute);
	if (minutesLeft < 1) return TimeLeftWords.Ending;
	const days = Math.floor(minutesLeft / (MinutesPerHour * HoursPerDay));
	const hours = Math.floor(minutesLeft / MinutesPerHour) % HoursPerDay;
	const minutes = minutesLeft % MinutesPerHour;
	if (days >= 1) return `${days}d ${hours}h`;
	if (hours >= 1) return `${hours}h ${minutes}m`;
	return `${minutes} min`;
}

export function hasEnded(endsAt: string | Date, now: Date) {
	return new Date(endsAt).getTime() <= now.getTime();
}
