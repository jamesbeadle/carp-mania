import type { Measures } from '../../contracts/TrophyRoom';
import { formatWeight } from '../../format/weight';

export type Edge = 'ahead' | 'level' | 'behind';

export function edgeOf(yours: number, theirs: number): Edge {
	if (yours > theirs) return 'ahead';
	if (yours < theirs) return 'behind';
	return 'level';
}

export function toBeatWords(theirName: string, yours: Measures, theirs: Measures): string {
	const edge = edgeOf(yours.personalBestLb, theirs.personalBestLb);
	if (theirs.personalBestLb <= 0) return `${theirName} has nothing on the bank yet. Anything you land puts you ahead.`;
	if (edge === 'ahead') return `Your best beats ${theirName}'s by ${formatWeight(yours.personalBestLb - theirs.personalBestLb)}. Keep it that way.`;
	if (edge === 'level') return `Level on personal bests. One ounce settles it.`;
	return `${formatWeight(theirs.personalBestLb - yours.personalBestLb)} to beat ${theirName}'s best.`;
}
