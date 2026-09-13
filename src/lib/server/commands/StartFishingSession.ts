import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { requireUser } from '../gates/requireUser';
import { GetFishingVisit } from '../queries/GetFishingVisit';

const CouldNotBuy = 'Could not buy a day ticket';
const NoSeed = 'The day ticket came without a seed — the session cannot start';

export type SessionStart = { visit: FishingVisit } | { refusal: string };

export async function StartFishingSession(locals: App.Locals, lakeId: string): Promise<SessionStart> {
	requireUser(locals);
	const { data: visitId, error: ticketError } = await locals.supabase.rpc('pay_day_ticket', { lake: lakeId });
	if (ticketError || !visitId) return { refusal: ticketError?.message ?? CouldNotBuy };
	const visit = await GetFishingVisit(locals, lakeId, visitId as string);
	if (!visit) return { refusal: NoSeed };
	return { visit };
}
