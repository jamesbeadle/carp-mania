import type { FishingVisit } from '$lib/contracts/FishingVisit';
import type { WaterAsFound } from '$lib/contracts/WaterAsFound';
import type { Skills } from '$lib/domain/anglerRating';
import { isDayTicketStillValid } from '$lib/domain/fishing/dayTicket';
import type { TicketKind } from '$lib/domain/fishing/ticketBook';
import { requireUser } from '../gates/requireUser';
import { loadRecentCapturesBefore } from './loadRecentCaptures';
import { loadStreakDays } from './loadStreak';
import { skillsOf } from './skillsOf';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';

interface VisitRow {
	id: string;
	visited_at: string;
	seed: number | null;
	session_from_hour: number;
	session_to_hour: number;
	sessions_left: number;
	water_as_found: WaterAsFound | null;
	skills_at_start: Skills | null;
	ticket_products: { kind: TicketKind } | null;
}

const VisitColumns = 'id, visited_at, seed, session_from_hour, session_to_hour, sessions_left, water_as_found, skills_at_start, ticket_products(kind)';
const FallbackKind: TicketKind = 'day';

export async function GetFishingVisit(locals: App.Locals, lakeId: string, visitId: string): Promise<FishingVisit | null> {
	const user = requireUser(locals);
	const { data } = await locals.supabase.from('lake_visits').select(VisitColumns).eq('id', visitId).eq('lake_id', lakeId).eq('angler_id', user.id).maybeSingle();
	const visit = data as VisitRow | null;
	if (!visit || !isVisitFishable(visit) || !isDayTicketStillValid(visit.visited_at, new Date())) return null;
	const visitedAt = new Date(visit.visited_at);
	const bailiff = trustedSupabase();
	return {
		id: visit.id,
		seed: Number(visit.seed),
		visitedAt: visit.visited_at,
		window: { fromHour: visit.session_from_hour, toHour: visit.session_to_hour },
		ticketKind: visit.ticket_products?.kind ?? FallbackKind,
		sessionsLeft: visit.sessions_left,
		recentCaptures: await loadRecentCapturesBefore(bailiff, lakeId, visitedAt),
		streakDays: await loadStreakDays(bailiff, user.id, visit.visited_at),
		waterAsFound: visit.water_as_found as WaterAsFound,
		skillsAtStart: skillsOf(visit.skills_at_start as Skills)
	};
}

function isVisitFishable(visit: VisitRow) {
	return visit.seed !== null && visit.water_as_found !== null && visit.skills_at_start !== null;
}
