import { isRegionCode, type RegionCode } from '$lib/domain/world/regionCodes';

export const WorldScope = 'world';
export type LeaderboardScope = RegionCode | typeof WorldScope;

export interface BiggestAliveEntry {
	carpId: string;
	name: string;
	weightLb: number;
	lakeId: string;
	lakeName: string;
}

export interface BiggestEverEntry {
	catchId: string;
	weightLb: number;
	anglerName: string;
	lakeName: string;
	caughtAt: string;
}

export interface TopReputationEntry {
	lakeId: string;
	name: string;
	reputation: number;
	ownerName: string;
}

export interface BestAnglerEntry {
	profileId: string;
	displayName: string;
	overallSkill: number;
}

export interface Leaderboards {
	biggestAlive: BiggestAliveEntry[];
	biggestEver: BiggestEverEntry[];
	topReputation: TopReputationEntry[];
	bestAnglers: BestAnglerEntry[];
}

export function leaderboardScopeFrom(requested: string | null): LeaderboardScope {
	if (requested && isRegionCode(requested)) return requested;
	return WorldScope;
}
