import type { Match, MatchPhase } from '$lib/domain/matches/matchTypes';

export interface MatchCard {
	match: Match;
	lakeName: string;
	ownerName: string;
	hostName: string;
	entryCount: number;
	pot: number;
	phase: MatchPhase;
	isEntered: boolean;
	isHost: boolean;
}

export interface MatchNoticeboard {
	inPlay: MatchCard[];
	comingUp: MatchCard[];
	recentlySettled: MatchCard[];
	myWaterId: string | null;
	loadedAt: string;
}
