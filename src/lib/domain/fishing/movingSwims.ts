export const SwimMove = { HoursToPackUpAndWalk: 0.5 } as const;

export const SwimMoveWords = { Duration: 'half an hour' } as const;

export function hourAfterMovingSwim(hour: number, endHour: number) {
	return Math.min(endHour, hour + SwimMove.HoursToPackUpAndWalk);
}
