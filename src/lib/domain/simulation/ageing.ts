import type { RandomFraction } from '../random';
import type { Carp } from '../types';
import { isWorldNewYear } from '../world/worldClock';

export const CarpLifespan = { SafeUntilYears: 22, ChanceInFirstOldYear: 0.05, ExtraChancePerYear: 0.015, CertainAtYears: 45 } as const;

export interface AgeingOutcome {
	carp: Carp[];
	diedOfOldAge: Carp[];
}

export function ageCarpIfNewYear(carp: Carp[], dayStart: Date, dayEnd: Date, random: RandomFraction): AgeingOutcome {
	if (!isWorldNewYear(dayStart, dayEnd)) return { carp, diedOfOldAge: [] };
	const aged = carp.map((fish) => ({ ...fish, age_years: fish.age_years + 1 }));
	const diedOfOldAge = aged.filter((fish) => random() < chanceOfDyingAt(fish.age_years));
	return { carp: aged.filter((fish) => !diedOfOldAge.includes(fish)), diedOfOldAge };
}

export function chanceOfDyingAt(ageYears: number) {
	if (ageYears < CarpLifespan.SafeUntilYears) return 0;
	if (ageYears >= CarpLifespan.CertainAtYears) return 1;
	return CarpLifespan.ChanceInFirstOldYear + (ageYears - CarpLifespan.SafeUntilYears) * CarpLifespan.ExtraChancePerYear;
}
