import type { BoardPlacing, Trophy } from '$lib/domain/matches/matchTypes';
import type { MatchCard } from './MatchCard';

export interface MatchPrizes {
	mostCatches: number;
	biggestFish: number;
}

export interface MatchPage {
	card: MatchCard;
	board: BoardPlacing[];
	carpNames: Record<string, string>;
	trophies: Trophy[];
	prizes: MatchPrizes;
	whyCannotEnter: string | null;
	loadedAt: string;
}
