export const CatchSettleSeconds = 3;

export function isSettledAfter(secondsSinceTheMat: number) {
	return secondsSinceTheMat >= CatchSettleSeconds;
}
