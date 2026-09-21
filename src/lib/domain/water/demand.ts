export const DemandTerms = { PegTurnoverPerDay: 1.4, QuietBelow: 0.8, BusyBelow: 1.2, TurningAwayBelow: 2, TurnedAwayReputationPerDay: 0.2 } as const;

export type DemandBand = 'quiet' | 'busy' | 'turning_away' | 'waiting_list';

export function pegsPerDayFor(swimCount: number) {
	return Math.max(1, swimCount * DemandTerms.PegTurnoverPerDay);
}

export function demandRatioFor(anglersWanting: number, swimCount: number) {
	return anglersWanting / pegsPerDayFor(swimCount);
}

export function demandBandOf(ratio: number): DemandBand {
	if (ratio < DemandTerms.QuietBelow) return 'quiet';
	if (ratio < DemandTerms.BusyBelow) return 'busy';
	if (ratio < DemandTerms.TurningAwayBelow) return 'turning_away';
	return 'waiting_list';
}

export const DemandWords: Record<DemandBand, { state: string; advice: string }> = {
	quiet: { state: 'quiet', advice: 'Advertise. Stock a thirty. Build a car park.' },
	busy: { state: 'busy', advice: 'Raise the ticket.' },
	turning_away: { state: 'turning anglers away', advice: 'Turn on advance booking — every angler turned away costs reputation.' },
	waiting_list: { state: 'a waiting list', advice: 'Sell a syndicate.' }
};

export function anglersTurnedAway(anglersWanting: number, swimCount: number) {
	return Math.max(0, Math.round(anglersWanting - pegsPerDayFor(swimCount)));
}

export function isTurningAnglersAway(ratio: number) {
	return ratio >= DemandTerms.BusyBelow;
}
