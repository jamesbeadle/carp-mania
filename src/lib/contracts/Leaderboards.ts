import { isRegionCode, type RegionCode } from '$lib/domain/world/regionCodes';

export const WorldScope = 'world';
export type LeaderboardScope = RegionCode | typeof WorldScope;

export const BoardLengths = [10, 25, 50] as const;
export type BoardLength = (typeof BoardLengths)[number];

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
	anglerId: string | null;
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
	rating: number;
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

export function boardLengthFrom(requested: string | null): BoardLength {
	const wanted = Number(requested);
	return BoardLengths.find((length) => length === wanted) ?? BoardLengths[0];
}

export function leaderboardsPathFor(scope: LeaderboardScope, top: BoardLength) {
	return `/world/leaderboards?region=${scope}&top=${top}`;
}
