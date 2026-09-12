import type { BookedWindow } from '$lib/domain/matches/bookings';

const BookedStatuses = ['open', 'settled'];

type BookingRow = { starts_at: string; ends_at: string };

export async function loadBookings(locals: App.Locals, lakeId: string, since: string): Promise<BookedWindow[]> {
	const { data } = await locals.supabase.from('matches').select('starts_at, ends_at').eq('lake_id', lakeId).in('status', BookedStatuses).gt('ends_at', since);
	return ((data ?? []) as BookingRow[]).map((booking) => ({ startsAt: booking.starts_at, endsAt: booking.ends_at }));
}
