import type { BoardNeighbour, MyRival } from '../../contracts/Rivalry';
import { formatWeight } from '../../format/weight';

export const NobodyAbove = 'Nobody above you';
const NothingAnywhereYet = 'Nothing on the bank anywhere yet. The first fish landed tops the world board.';

export function toBeatLine(rival: MyRival): string {
	if (rival.above === null) return theTopLine(rival);
	if (rival.standing.bestLb <= 0) return `Your first fish puts you on the ladder. ${rival.above.displayName} holds the last rung with ${formatWeight(rival.above.bestLb)}.`;
	return `${formatWeight(rival.above.bestLb - rival.standing.bestLb)} to beat.`;
}

function theTopLine(rival: MyRival): string {
	if (rival.standing.bestLb <= 0) return NothingAnywhereYet;
	return `The best fish by any angler is yours — ${formatWeight(rival.standing.bestLb)}. Hold it.`;
}

export function chaserLine(rival: MyRival): string | null {
	if (rival.below === null) return null;
	return `${rival.below.displayName} is ${formatWeight(rival.standing.bestLb - rival.below.bestLb)} behind you.`;
}

export function placeLine(neighbour: BoardNeighbour): string {
	return `No. ${neighbour.rank} · ${formatWeight(neighbour.bestLb)}`;
}
