import { SkillLabels, SkillNames, type SkillName } from './anglerSkills';
import type { Profile } from './types';

export const Pedigree = { PointsPerPound: 2, CapLb: 50 } as const;
export const RatingScale = { Lowest: 0, Highest: 100 } as const;

export interface AnglerRating {
	rating: number;
	craft: number;
	pedigree: number;
	heaviestLandedLb: number;
}

export type Skills = Pick<Profile, SkillName>;

export function craftOf(skills: Skills) {
	return SkillNames.reduce((total, skill) => total + Number(skills[skill]), 0) / SkillNames.length;
}

export function pedigreeOf(heaviestLandedLb: number) {
	const points = Math.max(0, heaviestLandedLb) * Pedigree.PointsPerPound;
	return Math.min(RatingScale.Highest, points);
}

export function anglerRatingOf(skills: Skills, heaviestLandedLb: number): AnglerRating {
	const craft = craftOf(skills);
	const pedigree = pedigreeOf(heaviestLandedLb);
	return { rating: Math.min(craft, pedigree), craft, pedigree, heaviestLandedLb };
}

export function weakestSkillOf(skills: Skills): SkillName {
	return SkillNames.reduce((weakest, skill) => (Number(skills[skill]) < Number(skills[weakest]) ? skill : weakest));
}

export function nextTenRatingAbove(pedigree: number) {
	return Math.min(RatingScale.Highest, Math.floor(pedigree / 10) * 10 + 10);
}

export function poundsForRating(rating: number) {
	return rating / Pedigree.PointsPerPound;
}

export function whatHoldsRatingBack(rating: AnglerRating, skills: Skills) {
	const isCraftAhead = rating.craft > rating.pedigree;
	const nextTen = nextTenRatingAbove(rating.pedigree);
	if (rating.rating >= RatingScale.Highest) return 'A fifty and four maxed skills. Nothing is holding you back.';
	if (isCraftAhead) return `Your craft is ahead of your fish. A ${poundsForRating(nextTen)}-pounder takes you to ${nextTen}.`;
	return `Your fish are ahead of your craft. Work on your ${SkillLabels[weakestSkillOf(skills)].toLowerCase()}.`;
}
