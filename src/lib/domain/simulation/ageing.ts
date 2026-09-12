import type { Carp } from '../types';
import { isWorldNewYear } from '../world/worldClock';

export function ageCarpIfNewYear(carp: Carp[], dayStart: Date, dayEnd: Date): Carp[] {
	if (!isWorldNewYear(dayStart, dayEnd)) return carp;
	return carp.map((fish) => ({ ...fish, age_years: fish.age_years + 1 }));
}
