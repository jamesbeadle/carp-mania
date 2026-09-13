import type { AnglerStanding } from './HallOfFame';

export interface BoardNeighbour {
	anglerId: string;
	displayName: string;
	avatarUrl: string | null;
	bestLb: number;
	rank: number;
}

export interface MyRival {
	standing: AnglerStanding;
	above: BoardNeighbour | null;
	below: BoardNeighbour | null;
}
