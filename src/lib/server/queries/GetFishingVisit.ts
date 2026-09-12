import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { isDayTicketStillValid } from '$lib/domain/fishing/dayTicket';
import { requireUser } from '../gates/requireUser';

interface VisitRow {
	id: string;
	visited_at: string;
	seed: number | null;
}

export async function GetFishingVisit(locals: App.Locals, lakeId: string, visitId: string): Promise<FishingVisit | null> {
	const user = requireUser(locals);
	const { data } = await locals.supabase
		.from('lake_visits')
		.select('id, visited_at, seed')
		.eq('id', visitId)
		.eq('lake_id', lakeId)
		.eq('angler_id', user.id)
		.maybeSingle();
	const visit = data as VisitRow | null;
	if (!visit || visit.seed === null || !isDayTicketStillValid(visit.visited_at, new Date())) return null;
	return { id: visit.id, seed: Number(visit.seed), visitedAt: visit.visited_at };
}
