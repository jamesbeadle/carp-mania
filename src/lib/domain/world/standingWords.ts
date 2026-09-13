import type { AnglerStanding } from '../../contracts/HallOfFame';
import { formatWeight } from '../../format/weight';

const NothingYet = 'Nothing on the bank here yet — the first fish you land puts you on the ladder.';

export function standingWords(standing: AnglerStanding, lastOnBoardLb: number | null): string {
	if (standing.bestLb <= 0) return NothingYet;
	const place = `You're No. ${standing.rank} of ${standing.anglers} ${standing.anglers === 1 ? 'angler' : 'anglers'}`;
	if (lastOnBoardLb === null || standing.bestLb >= lastOnBoardLb) return `${place}, with ${formatWeight(standing.bestLb)}.`;
	return `${place} — your ${formatWeight(standing.bestLb)} is ${formatWeight(lastOnBoardLb - standing.bestLb)} short of the board.`;
}

export function lastOnTheBoard<Entry extends { weightLb: number }>(board: Entry[], boardLength: number): number | null {
	if (board.length < boardLength) return null;
	return board[board.length - 1].weightLb;
}
