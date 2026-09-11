export type ReserveState = 'none' | 'met' | 'not_met';

export const ReserveWords: Record<ReserveState, string> = { none: 'no reserve', met: 'met', not_met: 'not met' };

export function reserveState(reservePrice: number | null, leadingBid: number | null): ReserveState {
	if (reservePrice === null) return 'none';
	if (leadingBid === null) return 'not_met';
	return leadingBid >= reservePrice ? 'met' : 'not_met';
}
