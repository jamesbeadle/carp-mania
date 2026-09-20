import { fail } from '@sveltejs/kit';
import { requireOwnedLake } from '../gates/requireOwnedLake';

export async function TurnOnAdvanceBooking(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const isOn = formData.get('isBookingOn') === 'true';
	const { error } = await locals.supabase.rpc('set_booking_on', { lake: lake.id, is_on: isOn });
	if (error) return fail(400, { message: error.message });
	return { message: isOn ? 'Advance booking is on — anglers book a peg and a ticket for a day' : 'The water is walk-on again' };
}
