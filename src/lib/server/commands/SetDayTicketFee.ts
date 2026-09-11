import { requireOwnedLake } from '../gates/requireOwnedLake';
import { readFormNumber } from '../gates/readFormNumber';

const DayTicket = { MinimumFee: 0, MaximumFee: 250 } as const;

export async function SetDayTicketFee(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const fee = readFormNumber(formData, 'fee', DayTicket.MinimumFee, DayTicket.MaximumFee);
	if (fee.failure) return fee.failure;

	await locals.supabase.from('lakes').update({ day_ticket_fee: fee.value }).eq('id', lake.id);
	return { message: `Day ticket set to £${fee.value}` };
}
