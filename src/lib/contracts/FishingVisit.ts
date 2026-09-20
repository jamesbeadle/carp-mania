import type { SessionWindow } from '$lib/domain/fishing/sessionWindow';
import type { TicketKind } from '$lib/domain/fishing/ticketBook';

export interface FishingVisit {
	id: string;
	seed: number;
	visitedAt: string;
	window: SessionWindow;
	ticketKind: TicketKind;
	sessionsLeft: number;
}
