import assert from 'node:assert/strict';
import { diaryFor, nextFreeDay, whyCannotBook } from '../src/lib/domain/water/bookings';
import { isMemberThisYear, isSyndicateWater, syndicateWords } from '../src/lib/domain/water/syndicate';
import { fisheryDayNumber } from '../src/lib/domain/world/worldClock';

const now = new Date('2026-09-19T12:00:00Z');

export function runBookingScenarios() {
	const swims = [{ id: 'peg-1' }, { id: 'peg-2' }];
	const today = fisheryDayNumber(now);
	const bookings = [{ swim_id: 'peg-1', fishery_day: today, status: 'booked' as const }, { swim_id: 'peg-2', fishery_day: today, status: 'booked' as const }, { swim_id: 'peg-1', fishery_day: today + 1, status: 'cancelled' as const }];
	const diary = diaryFor(swims, bookings, now);
	assert.equal(diary.length, 7, 'a week of days');
	assert.equal(diary[0].freePegs, 0, 'today is full');
	assert.equal(diary[1].freePegs, 2, 'a cancelled booking frees the peg');
	assert.equal(nextFreeDay(diary)?.fisheryDay, today + 1, 'next free peg: tomorrow');
	assert.ok(whyCannotBook(diary[0], 'peg-1'), 'a booked peg cannot be booked again');
	assert.equal(whyCannotBook(diary[1], 'peg-1'), null);
	const syndicate = { syndicate_places_for_sale: 3, syndicate_price: 400 };
	assert.ok(isSyndicateWater(syndicate) && !isSyndicateWater({ syndicate_places_for_sale: 0, syndicate_price: 0 }));
	assert.ok(syndicateWords(syndicate).includes('No day tickets'), 'a syndicate water sells no day tickets');
	const places = [{ angler_id: 'me', fishery_year: Math.floor(today / 365) }];
	assert.ok(isMemberThisYear(places, 'me', now) && !isMemberThisYear(places, 'you', now));
}
