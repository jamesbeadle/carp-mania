import type { Skills } from '$lib/domain/anglerRating';
import type { SessionWindow } from '$lib/domain/fishing/sessionWindow';
import type { TicketKind } from '$lib/domain/fishing/ticketBook';
import type { WaterAsFound } from './WaterAsFound';

export interface FishingVisit {
	id: string;
	seed: number;
	visitedAt: string;
	window: SessionWindow;
	ticketKind: TicketKind;
	sessionsLeft: number;
	recentCaptures: Record<string, number>;
	streakDays: number;
	waterAsFound: WaterAsFound;
	skillsAtStart: Skills;
}
