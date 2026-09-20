import assert from 'node:assert/strict';
import { biteRollFor, biteTimeOf, type BiteRoll, type RodInTheWater, type WaterToday } from '../src/lib/domain/fishing/biteRoll';
import { castTerrainFor } from '../src/lib/domain/fishing/castTerrain';
import { DayTicket, isDayTicketStillValid } from '../src/lib/domain/fishing/dayTicket';
import { ClassicSession, hoursInWindow } from '../src/lib/domain/fishing/sessionWindow';
import { mix } from '../src/lib/domain/fishing/sessionSeed';
import { carpOfTaker } from '../src/lib/domain/fishing/takers';
import { carpForRolledBite, carpInBiteOrder, takerOfTheBait } from '../src/lib/domain/fishing/whoTookTheBait';
import { EasyWater } from '../src/lib/domain/fishing/waterDifficulty';
import { seededRandom } from '../src/lib/domain/random';
import { classicCarp, classicLake } from '../src/lib/domain/sites/classicSite';
import { defaultRodSetup, kitFor, MaximumRods } from '../src/lib/domain/tackle/rodSetup';
import type { Carp, Lake } from '../src/lib/domain/types';
import type { RodSetup } from '../src/lib/domain/tackle/rodSetup';
import { seasonFor } from '../src/lib/domain/world/seasons';
import { weatherFor } from '../src/lib/domain/world/weather';

const VisitSeed = 123456789;
const DecentRating = 60;
const DecentWatercraft = 60;
const CastPoint = { x: 0.5, y: 0.5 };
const SeedsToCheck = 40;
const MinutesPerHour = 60;
const MillisecondsPerHour = 60 * 60 * 1000;

interface Slot {
	rodIndex: number;
	hour: number;
	roll: BiteRoll;
}

export function runBiteRollScenarios() {
	const lake: Lake = { id: 'lake-seeded', ...classicLake('owner-1', 'Seeded Water', new Date('2026-01-01T00:00:00Z')) };
	const carp: Carp[] = classicCarp(lake.id, seededRandom(7)).map((fish, index) => ({ ...fish, id: `carp-${index}` }));
	const june = new Date('2026-06-01T00:00:00Z');
	const water: WaterToday = { lake, rating: DecentRating, watercraft: DecentWatercraft, season: seasonFor(lake, june), weather: weatherFor(lake, june), shoals: [], difficulty: EasyWater, recentCaptures: {}, nuisanceShare: 0 };
	const setup = defaultRodSetup();
	const rod: RodInTheWater = { terrain: castTerrainFor(lake, CastPoint), kit: kitFor(setup) };

	const roll = biteRollFor(VisitSeed, 0, 7, rod, water);
	assert.deepEqual(roll, biteRollFor(VisitSeed, 0, 7, rod, water), 'the same inputs give the same roll');
	assert.notDeepEqual(roll, biteRollFor(VisitSeed, 1, 7, rod, water), 'another rod rolls differently');
	assert.notDeepEqual(roll, biteRollFor(VisitSeed, 0, 8, rod, water), 'another hour rolls differently');
	assert.ok(roll.minuteOfHour >= 0 && roll.minuteOfHour < MinutesPerHour, 'the bite falls inside the hour');
	assert.ok(biteTimeOf(7, roll) >= 7 && biteTimeOf(7, roll) < 8, 'the bite time is inside the hour');
	assertEverySlotHasItsOwnStream();

	const slots = slotsAcrossTheDay(rod, water);
	const takes = slots.filter((slot) => slot.roll.isTaking);
	const misses = slots.filter((slot) => !slot.roll.isTaking);
	assert.ok(takes.length >= 1, 'a decent setup gets at least one take in a day');
	assert.ok(misses.length >= 1, 'not every hour produces a fish');
	assertTheServerAgreesWithTheClient(takes[0], misses[0], carp, water, rod, setup);
	assertDayTicketsLapse();
	console.log('bite roll:', { takesInADay: takes.length, firstTake: takes[0] });
}

function slotsAcrossTheDay(rod: RodInTheWater, water: WaterToday): Slot[] {
	const slots: Slot[] = [];
	for (let rodIndex = 0; rodIndex < MaximumRods; rodIndex++) {
		for (let hour = ClassicSession.fromHour; hour < ClassicSession.toHour; hour++) {
			slots.push({ rodIndex, hour, roll: biteRollFor(VisitSeed, rodIndex, hour, rod, water) });
		}
	}
	return slots;
}

function assertEverySlotHasItsOwnStream() {
	for (let seed = 1; seed <= SeedsToCheck; seed++) {
		const streams = new Set<number>();
		for (let rodIndex = 0; rodIndex < MaximumRods; rodIndex++) {
			for (let hour = ClassicSession.fromHour; hour < ClassicSession.toHour; hour++) streams.add(mix(seed, rodIndex, hour));
		}
		assert.equal(streams.size, MaximumRods * hoursInWindow(ClassicSession), `seed ${seed} gives every rod-hour its own stream`);
	}
}

function assertTheServerAgreesWithTheClient(take: Slot, miss: Slot, carp: Carp[], water: WaterToday, rod: RodInTheWater, setup: RodSetup) {
	const spot = { terrain: rod.terrain, castPoint: CastPoint };
	const clientPick = carpOfTaker(takerOfTheBait(carpInBiteOrder(carp), { roll: take.roll, hour: take.hour, kit: rod.kit, seed: VisitSeed }, water, spot));
	const carpAsTheServerLoadsThem = [...carp].reverse();
	const reportOf = (slot: Slot) => ({ seed: VisitSeed, rodIndex: slot.rodIndex, hour: slot.hour, castPoint: CastPoint, setup });
	const serverPick = carpForRolledBite(reportOf(take), water, carpAsTheServerLoadsThem);
	assert.ok(clientPick && serverPick, 'both sides find a fish');
	assert.equal(serverPick.id, clientPick.id, 'the server picks the same carp as the client');
	assert.equal(carpForRolledBite(reportOf(miss), water, carp), null, 'an hour without a take cannot be claimed');
}

function assertDayTicketsLapse() {
	const ticketTime = new Date('2026-09-11T10:00:00Z');
	const anHourOn = new Date(ticketTime.getTime() + MillisecondsPerHour);
	const longAfter = new Date(ticketTime.getTime() + (DayTicket.ValidForHours + 1) * MillisecondsPerHour);
	assert.ok(isDayTicketStillValid(ticketTime.toISOString(), anHourOn), 'a ticket is good an hour on');
	assert.ok(!isDayTicketStillValid(ticketTime.toISOString(), longAfter), 'a ticket lapses');
}
