import { error } from '@sveltejs/kit';
import { requireUser } from '../gates/requireUser';

export async function PayDayTicket(locals: App.Locals, lakeId: string): Promise<string> {
	requireUser(locals);
	const { data: visitId, error: paymentError } = await locals.supabase.rpc('pay_day_ticket', { lake: lakeId });
	if (paymentError || !visitId) error(400, paymentError?.message ?? 'Could not buy a day ticket');
	return visitId as string;
}
