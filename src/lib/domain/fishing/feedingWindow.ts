import { stableHash } from '../layout/favouriteFeature';
import type { Carp } from '../types';

export type FeedingWindow = 'first_light' | 'evening' | 'night' | 'all_day';

export const FeedingWindows: FeedingWindow[] = ['first_light', 'evening', 'night', 'all_day'];
export const FeedingWindowFit = { Inside: 1.25, Outside: 0.85 } as const;

const WindowHours: Record<FeedingWindow, { from: number; to: number } | null> = {
	first_light: { from: 4, to: 10 },
	evening: { from: 16, to: 24 },
	night: { from: 20, to: 29 },
	all_day: null
};

export const FeedingWindowWords: Record<FeedingWindow, string> = {
	first_light: 'feeds at first light',
	evening: 'feeds in the evening',
	night: 'feeds after dark',
	all_day: 'feeds at any hour'
};

const HoursInADay = 24;
const WindowSalt = 'feeding-window';

export function feedingWindowOf(carp: Pick<Carp, 'id'>): FeedingWindow {
	return FeedingWindows[stableHash(carp.id + WindowSalt) % FeedingWindows.length];
}

export function isInsideFeedingWindow(window: FeedingWindow, hour: number) {
	const hours = WindowHours[window];
	if (!hours) return true;
	const hourOfDay = hour % HoursInADay;
	const isWithin = (candidate: number) => candidate >= hours.from && candidate < hours.to;
	return isWithin(hourOfDay) || isWithin(hourOfDay + HoursInADay);
}

export function feedingWindowFit(carp: Pick<Carp, 'id'>, hour: number) {
	return isInsideFeedingWindow(feedingWindowOf(carp), hour) ? FeedingWindowFit.Inside : FeedingWindowFit.Outside;
}
