import type { BookingDiary } from '$lib/contracts/BookingDiary';
import type { Swim } from '$lib/domain/types';
import { diaryFor, type PegBooking } from '$lib/domain/water/bookings';
import { isMemberThisYear, type SyndicatePlace } from '$lib/domain/water/syndicate';
import { fisheryDayNumber } from '$lib/domain/world/worldClock';
import { requireUser } from '../gates/requireUser';
import { GetTicketBook } from './GetTicketBook';

const Booked = 'booked';

export async function GetBookingDiary(locals: App.Locals, lakeId: string, now = new Date()): Promise<BookingDiary> {
	const user = requireUser(locals);
	const [swims, bookings, book, places] = await Promise.all([loadSwims(locals, lakeId), loadBookingsFrom(locals, lakeId, fisheryDayNumber(now)), GetTicketBook(locals, lakeId), loadPlaces(locals, lakeId)]);
	return {
		days: diaryFor(swims, bookings, now),
		swims,
		book,
		myBookings: bookings.filter((booking) => booking.angler_id === user.id),
		places,
		isMember: isMemberThisYear(places, user.id, now)
	};
}

export async function loadMyBookings(locals: App.Locals, anglerId: string, now = new Date()): Promise<PegBooking[]> {
	const { data } = await locals.supabase.from('bookings').select('*').eq('angler_id', anglerId).gte('fishery_day', fisheryDayNumber(now)).eq('status', Booked).order('fishery_day');
	return (data ?? []) as PegBooking[];
}

async function loadSwims(locals: App.Locals, lakeId: string): Promise<Swim[]> {
	const { data } = await locals.supabase.from('swims').select('*').eq('lake_id', lakeId).order('name');
	return (data ?? []) as Swim[];
}

async function loadBookingsFrom(locals: App.Locals, lakeId: string, fromDay: number): Promise<PegBooking[]> {
	const { data } = await locals.supabase.from('bookings').select('*').eq('lake_id', lakeId).gte('fishery_day', fromDay);
	return (data ?? []) as PegBooking[];
}

async function loadPlaces(locals: App.Locals, lakeId: string): Promise<SyndicatePlace[]> {
	const { data } = await locals.supabase.from('syndicate_places').select('*').eq('lake_id', lakeId);
	return (data ?? []) as SyndicatePlace[];
}
