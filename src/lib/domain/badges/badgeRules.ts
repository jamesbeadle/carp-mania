export const BadgeName = { ShortestLength: 2, LongestLength: 40 } as const;
export const BadgeWords = { LongestLength: 160 } as const;
export const BadgeCitation = { LongestLength: 160 } as const;

export const BadgeMetals = ['bronze', 'silver', 'gold', 'platinum'] as const;
export type BadgeMetal = (typeof BadgeMetals)[number];

export const BadgeMetalLabels: Record<BadgeMetal, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };

export function isBadgeMetal(candidate: unknown): candidate is BadgeMetal {
	return (BadgeMetals as readonly unknown[]).includes(candidate);
}

export function isBadgeName(candidate: string) {
	return candidate.length >= BadgeName.ShortestLength && candidate.length <= BadgeName.LongestLength;
}

export function isBadgeWords(candidate: string) {
	return candidate.length <= BadgeWords.LongestLength;
}

export function isBadgeCitation(candidate: string) {
	return candidate.length <= BadgeCitation.LongestLength;
}

export function badgeNameRuleWords() {
	return `${BadgeName.ShortestLength}–${BadgeName.LongestLength} characters`;
}
