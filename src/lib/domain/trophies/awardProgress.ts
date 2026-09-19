import { AwardCatalogue, AwardKeys, type AwardKey, type AwardTallies } from './awards';

export interface AwardProgress {
	key: AwardKey;
	have: number;
	target: number;
	share: number;
}

export const MostNextAwards = 3;
const PoundsSuffix = 'Lb';

export function isAwardEarned(key: AwardKey, tallies: AwardTallies) {
	const award = AwardCatalogue[key];
	return tallies[award.tally] >= award.target;
}

export function awardsEarnedBy(tallies: AwardTallies): AwardKey[] {
	return AwardKeys.filter((key) => isAwardEarned(key, tallies));
}

export function newlyEarned(tallies: AwardTallies, held: AwardKey[]): AwardKey[] {
	return awardsEarnedBy(tallies).filter((key) => !held.includes(key));
}

export function progressOf(key: AwardKey, tallies: AwardTallies): AwardProgress {
	const award = AwardCatalogue[key];
	const have = tallies[award.tally];
	return { key, have, target: award.target, share: Math.min(1, have / award.target) };
}

export function nextAwardsFor(tallies: AwardTallies, held: AwardKey[], most = MostNextAwards): AwardProgress[] {
	const outstanding = AwardKeys.filter((key) => !held.includes(key) && !isAwardEarned(key, tallies));
	const byCloseness = outstanding.map((key) => progressOf(key, tallies)).sort((left, right) => right.share - left.share);
	return byCloseness.slice(0, most);
}

export function awardWordsFor(progress: AwardProgress) {
	const award = AwardCatalogue[progress.key];
	const left = progress.target - progress.have;
	const isInPounds = award.tally.endsWith(PoundsSuffix);
	if (isInPounds) return `${award.label} — ${Math.round(left)} lb short`;
	return `${award.label} — ${Math.ceil(left)} to go`;
}
