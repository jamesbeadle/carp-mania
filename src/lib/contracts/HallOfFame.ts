import type { CarpMemorial } from '$lib/domain/memorialTypes';
import type { LeaderboardScope } from './Leaderboards';

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

export interface HallOfFame {
	scope: LeaderboardScope;
	biggestEver: HallOfFameCatch[];
	legends: CarpMemorial[];
	mostFishLanded: ProlificAngler[];
	watersOfLegend: WaterOfLegend[];
}
