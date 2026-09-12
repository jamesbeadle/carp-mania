import { MatchTerms } from '$lib/domain/matches/matchRules';

const HoursPerDay = 24;
const HoursPerWeek = 168;

export const StartChoices = MatchTerms.StartsInHours.map((hours) => ({ hours, label: startWords(hours) }));
export const LengthChoices = MatchTerms.LastsHours.map((hours) => ({ hours, label: `${hours} hours` }));
export const SplitChoices = MatchTerms.Splits.map((share) => ({ share, label: splitWords(share) }));

export function suggestedTitleFor(lakeName: string) {
	return `The ${lakeName} Open`;
}

function startWords(hours: number) {
	if (hours === 1) return 'In an hour';
	if (hours === HoursPerWeek) return 'In a week';
	if (hours === HoursPerDay) return 'Tomorrow, about this time';
	if (hours > HoursPerDay) return `In ${hours / HoursPerDay} days`;
	return `In ${hours} hours`;
}

function splitWords(share: number) {
	if (share === MatchTerms.WholeShare) return 'All of it to most catches';
	if (share === 0) return 'All of it to the biggest fish';
	return `${share}% to most catches, ${MatchTerms.WholeShare - share}% to the biggest fish`;
}
