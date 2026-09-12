import type { Match, MatchPhase } from './matchTypes';

export const MatchTerms = {
	LastsHours: [3, 6, 12, 24] as const,
	StartsInHours: [1, 2, 3, 6, 12, 24, 48, 72, 168] as const,
	Splits: [100, 75, 50, 25, 0] as const,
	AnglersTurnedAwayPerHour: 6,
	SmallestBookingFee: 100,
	LargestEntryFee: 100_000,
	LargestStake: 1_000_000,
	MostOpenMatchesPerHost: 3,
	Title: { Shortest: 3, Longest: 60 },
	WholeShare: 100,
	PenceInThePound: 100
} as const;

export interface MatchOrder {
	title: string;
	startsInHours: number;
	lastsHours: number;
	entryFee: number;
	hostStake: number;
	mostCatchesShare: number;
}

const isOneOf = (choices: readonly number[], value: number) => choices.includes(value);

export function bookingFeeFor(dayTicketFee: number, lastsHours: number, isOwnWater: boolean) {
	if (isOwnWater) return 0;
	return Math.max(MatchTerms.SmallestBookingFee, Math.round(dayTicketFee * MatchTerms.AnglersTurnedAwayPerHour * lastsHours));
}

export function whyMatchCannotBeBooked(order: MatchOrder, pegs: number, openMatchesHosted: number): string | null {
	if (order.title.length < MatchTerms.Title.Shortest || order.title.length > MatchTerms.Title.Longest) return `The match needs a name of ${MatchTerms.Title.Shortest} to ${MatchTerms.Title.Longest} letters`;
	if (!isOneOf(MatchTerms.StartsInHours, order.startsInHours)) return 'Pick when the match starts';
	if (!isOneOf(MatchTerms.LastsHours, order.lastsHours)) return `A match lasts ${MatchTerms.LastsHours.join(', ')} hours`;
	if (order.entryFee < 0 || order.entryFee > MatchTerms.LargestEntryFee) return 'The entry fee must be a sensible sum';
	if (order.hostStake < 0 || order.hostStake > MatchTerms.LargestStake) return 'The stake must be a sensible sum';
	if (order.entryFee === 0 && order.hostStake === 0) return 'Put something in the pot: an entry fee or a stake';
	if (!isOneOf(MatchTerms.Splits, order.mostCatchesShare)) return 'Pick how the pot is split';
	if (pegs === 0) return 'That water has no pegs to fish from';
	if (openMatchesHosted >= MatchTerms.MostOpenMatchesPerHost) return `You already have ${MatchTerms.MostOpenMatchesPerHost} matches on the go`;
	return null;
}

export function matchPhaseOf(match: Pick<Match, 'status' | 'starts_at' | 'ends_at'>, now: Date): MatchPhase {
	if (match.status !== 'open') return match.status;
	if (new Date(match.starts_at) > now) return 'upcoming';
	if (new Date(match.ends_at) > now) return 'in_play';
	return 'ended';
}

export function whyCannotEnter(match: Pick<Match, 'status' | 'starts_at' | 'ends_at' | 'pegs'>, entryCount: number, isEntered: boolean, now: Date): string | null {
	const phase = matchPhaseOf(match, now);
	if (isEntered) return 'You are in';
	if (phase === 'cancelled') return 'The match was called off';
	if (phase !== 'upcoming' && phase !== 'in_play') return 'The match is over';
	if (entryCount >= match.pegs) return 'Every peg is taken';
	return null;
}

export function potOf(match: Pick<Match, 'entry_fee' | 'host_stake'>, entryCount: number) {
	return Number(match.entry_fee) * entryCount + Number(match.host_stake);
}

export function prizesFor(pot: number, mostCatchesShare: number) {
	const mostCatches = Math.round((pot * mostCatchesShare) / MatchTerms.WholeShare * MatchTerms.PenceInThePound) / MatchTerms.PenceInThePound;
	return { mostCatches, biggestFish: pot - mostCatches };
}
