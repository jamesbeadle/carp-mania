export const AnglerName = { ShortestLength: 3, LongestLength: 24, Allowed: /^[A-Za-z0-9]+$/ } as const;

export function isAnglerName(value: string) {
	const isRightLength = value.length >= AnglerName.ShortestLength && value.length <= AnglerName.LongestLength;
	return isRightLength && AnglerName.Allowed.test(value);
}

export function anglerNameRuleWords() {
	return `${AnglerName.ShortestLength}–${AnglerName.LongestLength} letters and numbers, no spaces, and nobody else's`;
}
