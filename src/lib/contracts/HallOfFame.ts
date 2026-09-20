import type { CarpMemorial } from '$lib/domain/memorialTypes';
import type { LeaderboardScope } from './Leaderboards';
import type { PrototypeOnTheBoard } from './Prototypes';

export const HallBoard = { Length: 10 } as const;

export interface HallOfFameCatch {
	catchId: string;
	carpId: string | null;
	fishName: string;
	weightLb: number;
	anglerId: string | null;
	anglerName: string;
	ownerName: string | null;
	lakeId: string;
	lakeName: string;
	caughtAt: string;
	isStillSwimming: boolean;
}

export interface ProlificAngler {
	anglerId: string;
	anglerName: string;
	catches: number;
	heaviestLb: number;
}

export interface WaterOfLegend {
	lakeId: string;
	lakeName: string;
	ownerName: string;
	heaviestLb: number;
	catches: number;
}

export interface MatchWinner {
	anglerId: string;
	anglerName: string;
	trophies: number;
	prizeMoney: number;
	latestTitle: string;
}

export interface AnglerStanding {
	rank: number;
	bestLb: number;
	anglers: number;
}

export interface VisitorsBest {
	weightLb: number;
	carpId: string | null;
	lakeId: string;
	lakeName: string;
	anglerName: string;
	caughtAt: string;
}

export interface HallOfFame {
	scope: LeaderboardScope;
	biggestEver: HallOfFameCatch[];
	standing: AnglerStanding;
	visitorsBest: VisitorsBest | null;
	legends: CarpMemorial[];
	mostFishLanded: ProlificAngler[];
	watersOfLegend: WaterOfLegend[];
	matchWinners: MatchWinner[];
	prototypes: PrototypeOnTheBoard[];
}
