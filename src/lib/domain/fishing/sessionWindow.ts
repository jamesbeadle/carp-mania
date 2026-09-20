import { HoursInADay, TicketKindCatalogue, type TicketKind } from './ticketBook';

export interface SessionWindow {
	fromHour: number;
	toHour: number;
}

export const LongestSession: SessionWindow = { fromHour: 0, toHour: HoursInADay * 2 };
export const ClassicSession: SessionWindow = { fromHour: 5, toHour: 24 };

export function sessionWindowFor(kind: TicketKind): SessionWindow {
	const profile = TicketKindCatalogue[kind];
	return { fromHour: profile.fromHour, toHour: profile.toHour };
}

export function hourOfDay(hour: number) {
	return ((hour % HoursInADay) + HoursInADay) % HoursInADay;
}

export function isWindowOver(hour: number, window: SessionWindow) {
	return hour >= window.toHour;
}

export function isInsideWindow(hour: number, window: SessionWindow) {
	return hour >= window.fromHour && hour < window.toHour;
}

export function hoursInWindow(window: SessionWindow) {
	return window.toHour - window.fromHour;
}

export function windowProgress(hour: number, window: SessionWindow) {
	const progress = (hour - window.fromHour) / hoursInWindow(window);
	return Math.min(1, Math.max(0, progress));
}

export function crossesMidnight(window: SessionWindow) {
	return window.toHour > HoursInADay;
}
