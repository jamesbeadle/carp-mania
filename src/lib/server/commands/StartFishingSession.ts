import { error } from '@sveltejs/kit';
import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { requireUser } from '../gates/requireUser';
import { GetFishingVisit } from '../queries/GetFishingVisit';

const HttpStatus = { BadRequest: 400, ServerError: 500 } as const;

export async function StartFishingSession(locals: App.Locals, lakeId: string): Promise<FishingVisit> {
	requireUser(locals);
	const { data: visitId, error: ticketError } = await locals.supabase.rpc('pay_day_ticket', { lake: lakeId });
	if (ticketError || !visitId) error(HttpStatus.BadRequest, ticketError?.message ?? 'Could not buy a day ticket');
	const visit = await GetFishingVisit(locals, lakeId, visitId as string);
	if (!visit) error(HttpStatus.ServerError, 'The day ticket came without a seed — the session cannot start');
	return visit;
}
