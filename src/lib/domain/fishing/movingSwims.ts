import { FishingDay } from './sessionClock';

export const SwimMove = { HoursToPackUpAndWalk: 0.5 } as const;

export const SwimMoveWords = { Duration: 'half an hour' } as const;

export function hourAfterMovingSwim(hour: number) {
	return Math.min(FishingDay.EndHour, hour + SwimMove.HoursToPackUpAndWalk);
}
