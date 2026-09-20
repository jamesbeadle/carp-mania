const MillisecondsPerDay = 24 * 60 * 60 * 1000;

export const Streak = { BitesPerDay: 0.1, MostDays: 5 } as const;

export function streakDaysOf(daysFished: string[], visitedAt: string) {
	const fished = new Set(daysFished.map(dayOf));
	let day = dayOf(visitedAt);
	let streak = 0;
	while (fished.has(day)) {
		streak += 1;
		day = theDayBefore(day);
	}
	return Math.max(1, streak);
}

export function streakIfFishedOn(daysFished: string[], day: string) {
	return streakDaysOf([...daysFished, day], day);
}

export function streakBiteFactor(streakDays: number) {
	const daysThatCount = Math.min(Streak.MostDays, Math.max(1, streakDays)) - 1;
	return 1 + daysThatCount * Streak.BitesPerDay;
}

export function streakWords(streakDays: number) {
	const factor = streakBiteFactor(streakDays);
	const bonus = Math.round((factor - 1) * 100);
	if (streakDays <= 1) return 'Day 1 on the bank — come back tomorrow and the fish start to know you';
	if (streakDays >= Streak.MostDays) return `Day ${streakDays} in a row — bites ×${factor.toFixed(1)}, the most a streak gives`;
	return `Day ${streakDays} in a row — bites +${bonus}%, and more tomorrow`;
}

export function dayOf(timestamp: string) {
	return timestamp.slice(0, 10);
}

function theDayBefore(day: string) {
	return new Date(new Date(`${day}T00:00:00Z`).getTime() - MillisecondsPerDay).toISOString().slice(0, 10);
}
