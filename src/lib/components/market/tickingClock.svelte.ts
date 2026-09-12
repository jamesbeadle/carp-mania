export const ClockTick = { EveryMilliseconds: 30 * 1000 } as const;

export class TickingClock {
	tickedAt = $state<Date | null>(null);

	start(everyMilliseconds: number = ClockTick.EveryMilliseconds) {
		const handle = setInterval(() => (this.tickedAt = new Date()), everyMilliseconds);
		return () => clearInterval(handle);
	}

	nowOr(loadedAt: string) {
		return this.tickedAt ?? new Date(loadedAt);
	}
}
