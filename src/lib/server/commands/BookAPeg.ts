import { fail } from '@sveltejs/kit';
import { whyCannotBook } from '$lib/domain/water/bookings';
import { formatWhen } from '$lib/format/dates';
import { readFormNumber } from '../gates/readFormNumber';
import { requireUser } from '../gates/requireUser';
import { GetBookingDiary } from '../queries/GetBookingDiary';

const Fields = { Swim: 'swimId', Product: 'productId', Day: 'fisheryDay' } as const;
const LargestDay = 10_000_000;

export async function BookAPeg(locals: App.Locals, lakeId: string, formData: FormData) {
	requireUser(locals);
	const day = readFormNumber(formData, Fields.Day, 0, LargestDay);
	if (day.failure) return day.failure;
	const swimId = String(formData.get(Fields.Swim) ?? '');
	const diary = await GetBookingDiary(locals, lakeId);
	const wanted = day.value;
	const chosenDay = diary.days.find((candidate) => candidate.fisheryDay === wanted);
	const refusal = whyCannotBook(chosenDay, swimId);
	if (refusal || !chosenDay) return fail(400, { message: refusal ?? 'No such day' });
	const product = String(formData.get(Fields.Product) ?? '');
	const { error } = await locals.supabase.rpc('book_a_peg', { lake: lakeId, swim: swimId, product, day: wanted });
	if (error) return fail(400, { message: error.message });
	return { message: `Peg booked for ${formatWhen(chosenDay.startsAt.toISOString())}` };
}
