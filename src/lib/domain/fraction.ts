export function clampFraction(value: number) {
	return Math.min(1, Math.max(0, value));
}

export function fractionOfHundred(value: number) {
	return clampFraction(value / 100);
}
