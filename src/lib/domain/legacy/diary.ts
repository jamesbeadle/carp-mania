import type { Fisherman } from './fishermanTypes';

export const DiaryClock = { RealDaysPerYear: 4, SlowingDownWithinYears: 5 } as const;
const MillisecondsPerDay = 24 * 60 * 60 * 1000;

type Living = Pick<Fisherman, 'born_age' | 'retires_at_age' | 'started_at' | 'retired_at'>;

export function diaryAgeOf(fisherman: Living, at: Date) {
	const end = fisherman.retired_at ? new Date(fisherman.retired_at) : at;
	const realDays = (end.getTime() - new Date(fisherman.started_at).getTime()) / MillisecondsPerDay;
	return fisherman.born_age + Math.floor(Math.max(0, realDays) / DiaryClock.RealDaysPerYear);
}

export function yearsLeftFor(fisherman: Living, at: Date) {
	return Math.max(0, fisherman.retires_at_age - diaryAgeOf(fisherman, at));
}

export function isRetirementDue(fisherman: Living, at: Date) {
	return fisherman.retired_at === null && yearsLeftFor(fisherman, at) === 0;
}

export function isSlowingDown(fisherman: Living, at: Date) {
	return fisherman.retired_at === null && !isRetirementDue(fisherman, at) && yearsLeftFor(fisherman, at) <= DiaryClock.SlowingDownWithinYears;
}

export function ordinalOf(generation: number) {
	const tail = generation % 100;
	if (tail >= 11 && tail <= 13) return `${generation}th`;
	const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
	return `${generation}${suffixes[generation % 10] ?? 'th'}`;
}

export function placeInTheLine(generation: number) {
	if (generation === 1) return 'first of the line';
	return `${ordinalOf(generation)} of the line`;
}
