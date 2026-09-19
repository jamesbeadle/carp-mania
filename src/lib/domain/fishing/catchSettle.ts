export const CatchSettleSeconds = 1.2;

export function isSettledAfter(secondsSinceTheMat: number) {
	return secondsSinceTheMat >= CatchSettleSeconds;
}
