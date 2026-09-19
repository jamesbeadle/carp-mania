import type { MyDiaryEntry } from '$lib/contracts/MyDiary';
import type { PegBooking } from '$lib/domain/water/bookings';
import { requireUser } from '../gates/requireUser';
import { loadMyBookings } from './GetBookingDiary';

const UnknownWater = 'a water';
const UnknownPeg = 'a peg';

export async function GetMyDiary(locals: App.Locals): Promise<MyDiaryEntry[]> {
	const user = requireUser(locals);
	const bookings = await loadMyBookings(locals, user.id);
	if (bookings.length === 0) return [];
	const lakeIds = bookings.map((booking) => booking.lake_id);
	const swimIds = bookings.map((booking) => booking.swim_id);
	const [{ data: lakes }, { data: swims }] = await Promise.all([
		locals.supabase.from('lakes').select('id, name').in('id', lakeIds),
		locals.supabase.from('swims').select('id, name').in('id', swimIds)
	]);
	const lakeNames = new Map(((lakes ?? []) as { id: string; name: string }[]).map((lake) => [lake.id, lake.name]));
	const swimNames = new Map(((swims ?? []) as { id: string; name: string }[]).map((swim) => [swim.id, swim.name]));
	return bookings.map((booking) => entryFor(booking, lakeNames, swimNames));
}

function entryFor(booking: PegBooking, lakeNames: Map<string, string>, swimNames: Map<string, string>): MyDiaryEntry {
	const lakeName = lakeNames.get(booking.lake_id) ?? UnknownWater;
	const swimName = swimNames.get(booking.swim_id) ?? UnknownPeg;
	return { booking, lakeName, swimName };
}
