import type { BoardPlacing } from './matchTypes';

export interface BoardLeaders {
	mostCatches: Set<string>;
	biggestFish: Set<string>;
}

export function leadersOf(board: BoardPlacing[]): BoardLeaders {
	const withFish = board.filter((placing) => placing.catches > 0);
	const mostCatches = Math.max(0, ...withFish.map((placing) => placing.catches));
	const heaviest = Math.max(0, ...withFish.map((placing) => placing.heaviestLb));
	return {
		mostCatches: new Set(withFish.filter((placing) => placing.catches === mostCatches).map((placing) => placing.anglerId)),
		biggestFish: new Set(withFish.filter((placing) => placing.heaviestLb === heaviest).map((placing) => placing.anglerId))
	};
}

export function placingOf(board: BoardPlacing[], anglerId: string | null) {
	return board.find((placing) => placing.anglerId === anglerId) ?? null;
}
