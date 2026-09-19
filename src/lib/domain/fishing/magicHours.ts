import { hourOfDay } from './sessionWindow';

export interface MagicWindow {
	fromHour: number;
	toHour: number;
	sizeFactor: number;
	words: string;
}

export const MagicHours: MagicWindow[] = [
	{ fromHour: 0, toHour: 5, sizeFactor: 1.5, words: 'The small hours — quiet, but what comes out is worth having' },
	{ fromHour: 5, toHour: 10, sizeFactor: 2.2, words: 'First light — the best five hours in the game' },
	{ fromHour: 10, toHour: 16, sizeFactor: 0.6, words: 'The afternoon — fish get caught; thirties do not' },
	{ fromHour: 16, toHour: 24, sizeFactor: 2, words: 'Into the dark — the other eight' }
];

export const MagicFactorRange = { Lowest: 0.6, Highest: 2.2 } as const;

export function magicWindowAt(hour: number): MagicWindow {
	const clockHour = hourOfDay(hour);
	return MagicHours.find((window) => clockHour >= window.fromHour && clockHour < window.toHour) ?? MagicHours[0];
}

export function magicHourSizeFactor(hour: number) {
	return magicWindowAt(hour).sizeFactor;
}

export function magicHourShare(hour: number) {
	const span = MagicFactorRange.Highest - MagicFactorRange.Lowest;
	return (magicHourSizeFactor(hour) - MagicFactorRange.Lowest) / span;
}

export function isAMagicHour(hour: number) {
	return magicHourSizeFactor(hour) >= MagicHours[3].sizeFactor;
}
