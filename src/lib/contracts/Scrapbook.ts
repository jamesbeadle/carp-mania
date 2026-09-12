import type { Fisherman } from '$lib/domain/legacy/fishermanTypes';
import type { Catch } from '$lib/domain/types';

export interface KnownFish {
	carpId: string;
	name: string;
	bestLb: number;
	timesCaught: number;
	isStillSwimming: boolean;
}

export interface Scrapbook {
	fisherman: Fisherman;
	age: number;
	catches: Catch[];
	totalCatches: number;
	personalBestLb: number;
	fishKnown: KnownFish[];
	carpNames: Record<string, string>;
	lakeNames: Record<string, string>;
	isMine: boolean;
}
