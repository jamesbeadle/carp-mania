import type { HonourKind } from '$lib/domain/fishing/honours';
import type { MilestoneKind } from '$lib/domain/trophies/milestones';

export type RecordScope = 'lake' | 'region' | 'world';

export interface CatchCard {
	catchId: string;
	carpId: string | null;
	fishName: string;
	weightLb: number;
	caughtAt: string;
	lakeId: string;
	lakeName: string;
	swimName: string;
	honoursOnTheDay: HonourKind[];
	stillHolds: RecordScope[];
	isStillSwimming: boolean;
}

export interface RecordHeld {
	scope: RecordScope;
	scopeId: string;
	scopeName: string;
	catchId: string;
	carpId: string | null;
	fishName: string;
	weightLb: number;
	caughtAt: string;
}

export interface Milestone {
	kind: MilestoneKind;
	reachedAt: string | null;
}

export interface AnglerRanks {
	bestRank: number;
	bestLb: number;
	skillRank: number;
	anglers: number;
}

export interface TrophyRoom {
	cards: CatchCard[];
	recordsHeld: RecordHeld[];
	milestones: Milestone[];
	ranks: AnglerRanks;
}

export interface Measures {
	personalBestLb: number;
	fishLanded: number;
	rating: number;
	recordsHeld: number;
	trophies: number;
}

export interface MeasureUp {
	theirName: string;
	theirs: Measures;
	yours: Measures;
}

export const TrophyRoomCards = 6;
