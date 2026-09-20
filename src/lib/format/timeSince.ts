const MillisecondsPerMinute = 60 * 1000;
const MinutesPerHour = 60;

export const TimeSinceWords = { JustNow: 'just now' } as const;

export function timeSince(startedAt: string | Date, now: Date) {
	const minutesAgo = Math.floor((now.getTime() - new Date(startedAt).getTime()) / MillisecondsPerMinute);
	if (minutesAgo < 1) return TimeSinceWords.JustNow;
	const hours = Math.floor(minutesAgo / MinutesPerHour);
	const minutes = minutesAgo % MinutesPerHour;
	if (hours >= 1) return `${hours}h ${minutes}m ago`;
	return `${minutes} min ago`;
}
