import assert from 'node:assert/strict';
import { isBookedOut } from '../src/lib/domain/matches/bookings';
import { leadersOf } from '../src/lib/domain/matches/matchBoard';
import { bookingFeeFor, matchPhaseOf, MatchTerms, potOf, prizesFor, whyCannotEnter, whyMatchCannotBeBooked, type MatchOrder } from '../src/lib/domain/matches/matchRules';

export function runMatchScenarios() {
	const order: MatchOrder = { title: 'The Willow Open', startsInHours: 3, lastsHours: 6, entryFee: 20, hostStake: 100, mostCatchesShare: 50 };
	assert.equal(bookingFeeFor(20, 3, false), 360, 'six anglers an hour at the day-ticket price');
	assert.equal(bookingFeeFor(2, 3, false), MatchTerms.SmallestBookingFee, 'a cheap water still costs the smallest booking fee');
	assert.equal(bookingFeeFor(20, 24, true), 0, 'your own water costs nothing to book');
	assert.equal(whyMatchCannotBeBooked(order, 12, 0), null, 'a sound order books');
	assert.match(whyMatchCannotBeBooked({ ...order, title: 'Op' }, 12, 0) ?? '', /needs a name/);
	assert.match(whyMatchCannotBeBooked({ ...order, lastsHours: 5 }, 12, 0) ?? '', /lasts 3, 6, 12, 24 hours/);
	assert.match(whyMatchCannotBeBooked({ ...order, entryFee: 0, hostStake: 0 }, 12, 0) ?? '', /Put something in the pot/);
	assert.match(whyMatchCannotBeBooked(order, 0, 0) ?? '', /no pegs/);
	assert.match(whyMatchCannotBeBooked(order, 12, MatchTerms.MostOpenMatchesPerHost) ?? '', /on the go/);

	const now = new Date('2026-09-12T12:00:00Z');
	const match = { status: 'open' as const, starts_at: '2026-09-12T13:00:00Z', ends_at: '2026-09-12T16:00:00Z', pegs: 2, entry_fee: 20, host_stake: 100 };
	assert.equal(matchPhaseOf(match, now), 'upcoming');
	assert.equal(matchPhaseOf(match, new Date('2026-09-12T14:00:00Z')), 'in_play');
	assert.equal(matchPhaseOf(match, new Date('2026-09-12T16:00:00Z')), 'ended', 'an open match past its end is waiting to be settled');
	assert.equal(matchPhaseOf({ ...match, status: 'settled' }, now), 'settled');
	assert.equal(whyCannotEnter(match, 1, false, now), null, 'a peg is free');
	assert.match(whyCannotEnter(match, 2, false, now) ?? '', /Every peg/);
	assert.match(whyCannotEnter(match, 1, true, now) ?? '', /You are in/);
	assert.match(whyCannotEnter(match, 1, false, new Date('2026-09-12T16:00:00Z')) ?? '', /over/);
	assert.equal(potOf(match, 2), 140, 'two entries and the stake');
	assert.deepEqual(prizesFor(140, 50), { mostCatches: 70, biggestFish: 70 });
	assert.deepEqual(prizesFor(25, 75), { mostCatches: 18.75, biggestFish: 6.25 });
	assert.deepEqual(prizesFor(140, 0), { mostCatches: 0, biggestFish: 140 });

	const board = [
		{ anglerId: 'a', anglerName: 'A', fishermanId: null, catches: 3, heaviestLb: 18, heaviestCarpId: 'x' },
		{ anglerId: 'b', anglerName: 'B', fishermanId: null, catches: 3, heaviestLb: 30, heaviestCarpId: 'y' },
		{ anglerId: 'c', anglerName: 'C', fishermanId: null, catches: 0, heaviestLb: 0, heaviestCarpId: null }
	];
	const leaders = leadersOf(board);
	assert.deepEqual([...leaders.mostCatches], ['a', 'b'], 'a tie leads together');
	assert.deepEqual([...leaders.biggestFish], ['b']);
	assert.equal(leadersOf([board[2]]).mostCatches.size, 0, 'nobody leads with nothing caught');

	const booked = [{ startsAt: '2026-09-12T13:00:00Z', endsAt: '2026-09-12T16:00:00Z' }];
	assert.equal(isBookedOut(booked, new Date('2026-09-12T12:00:00Z'), new Date('2026-09-12T13:00:00Z')), false, 'the hour before is open');
	assert.equal(isBookedOut(booked, new Date('2026-09-12T12:30:00Z'), new Date('2026-09-12T13:30:00Z')), true, 'an hour overlapping the match is booked out');
	assert.equal(isBookedOut(booked, new Date('2026-09-12T16:00:00Z'), new Date('2026-09-12T17:00:00Z')), false, 'the hour after is open again');
	console.log('matches:', { bookingFeeFor3Hours: bookingFeeFor(20, 3, false), pegs: 2 });
}
