import type { FishingVisit } from '$lib/contracts/FishingVisit';
import { isDayTicketStillValid } from '$lib/domain/fishing/dayTicket';
import type { TicketKind } from '$lib/domain/fishing/ticketBook';
import { requireUser } from '../gates/requireUser';

interface VisitRow {
	id: string;
	visited_at: string;
	seed: number | null;
	session_from_hour: number;
	session_to_hour: number;
	sessions_left: number;
	ticket_products: { kind: TicketKind } | null;
}

const VisitColumns = 'id, visited_at, seed, session_from_hour, session_to_hour, sessions_left, ticket_products(kind)';
const FallbackKind: TicketKind = 'day';

export async function GetFishingVisit(locals: App.Locals, lakeId: string, visitId: string): Promise<FishingVisit | null> {
	const user = requireUser(locals);
	const { data } = await locals.supabase.from('lake_visits').select(VisitColumns).eq('id', visitId).eq('lake_id', lakeId).eq('angler_id', user.id).maybeSingle();
	const visit = data as VisitRow | null;
	if (!visit || visit.seed === null || !isDayTicketStillValid(visit.visited_at, new Date())) return null;
	return {
		id: visit.id,
		seed: Number(visit.seed),
		visitedAt: visit.visited_at,
		window: { fromHour: visit.session_from_hour, toHour: visit.session_to_hour },
		ticketKind: visit.ticket_products?.kind ?? FallbackKind,
		sessionsLeft: visit.sessions_left
	};
}
