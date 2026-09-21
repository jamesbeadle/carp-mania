import type { RodSetup } from './rodSetup';

export interface RodSet {
	id: string;
	name: string;
	rods: RodSetup[];
	lastUsedAt: string;
}

export const RodSetName = { ShortestLength: 1, LongestLength: 40 } as const;
export const MostRodSets = 12;

export function isRodSetName(name: string) {
	const trimmed = name.trim();
	return trimmed.length >= RodSetName.ShortestLength && trimmed.length <= RodSetName.LongestLength;
}

export function lastUsedOf(sets: RodSet[]): RodSet | null {
	return [...sets].sort((first, second) => second.lastUsedAt.localeCompare(first.lastUsedAt))[0] ?? null;
}

export function whyCannotSaveRodSet(sets: RodSet[], name: string) {
	if (!isRodSetName(name)) return `A set needs a name of ${RodSetName.ShortestLength} to ${RodSetName.LongestLength} letters`;
	const isReplacing = sets.some((set) => set.name.toLowerCase() === name.trim().toLowerCase());
	if (!isReplacing && sets.length >= MostRodSets) return `${MostRodSets} sets is the most the tackle box holds — drop one first`;
	return null;
}
