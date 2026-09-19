import { FisheryClock } from '../simulation/elapsedDays';
import type { Swim } from '../types';
import { fisheryDayNumber } from '../world/worldClock';

export type BookingStatus = 'booked' | 'fished' | 'forfeited' | 'cancelled';

export interface PegBooking {
	id: string;
	lake_id: string;
	swim_id: string;
	angler_id: string;
	ticket_product_id: string | null;
	fishery_day: number;
	fee_paid: number;
	status: BookingStatus;
	booked_at: string;
}

export const BookingWindow = { DaysAhead: 7 } as const;

export interface DiaryDay {
	fisheryDay: number;
	startsAt: Date;
	freePegs: number;
	bookedSwimIds: string[];
}

export function fisheryDayStart(fisheryDay: number) {
	return new Date(fisheryDay * FisheryClock.RealMillisecondsPerFisheryDay);
}

export function diaryFor(swims: Pick<Swim, 'id'>[], bookings: Pick<PegBooking, 'swim_id' | 'fishery_day' | 'status'>[], now: Date): DiaryDay[] {
	const today = fisheryDayNumber(now);
	return Array.from({ length: BookingWindow.DaysAhead }, (_, offset) => dayOf(today + offset, swims, bookings));
}

function dayOf(fisheryDay: number, swims: Pick<Swim, 'id'>[], bookings: Pick<PegBooking, 'swim_id' | 'fishery_day' | 'status'>[]): DiaryDay {
	const bookedSwimIds = bookings.filter((booking) => booking.fishery_day === fisheryDay && booking.status === 'booked').map((booking) => booking.swim_id);
	return { fisheryDay, startsAt: fisheryDayStart(fisheryDay), freePegs: Math.max(0, swims.length - bookedSwimIds.length), bookedSwimIds };
}

export function nextFreeDay(diary: DiaryDay[]) {
	return diary.find((day) => day.freePegs > 0) ?? null;
}

export function whyCannotBook(day: DiaryDay | undefined, swimId: string) {
	if (!day) return 'Bookings open a week ahead';
	if (day.bookedSwimIds.includes(swimId)) return 'That peg is booked that day';
	return null;
}

export function dayWords(day: DiaryDay, now: Date) {
	const offset = day.fisheryDay - fisheryDayNumber(now);
	if (offset === 0) return 'Today';
	if (offset === 1) return 'Tomorrow';
	return `In ${offset} days`;
}
