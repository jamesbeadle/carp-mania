import assert from 'node:assert/strict';
import { biteChanceForOneHour } from '../src/lib/domain/fishing/biteChance';
import { castTerrainFor, terrainInFrontOfSwim } from '../src/lib/domain/fishing/castTerrain';
import { matchTackleToWater } from '../src/lib/domain/fishing/tackleMatch';
import { noRecordsYet } from '../src/lib/domain/market/records';
import { seededRandom } from '../src/lib/domain/random';
import { simulateOneDay, type DayContext } from '../src/lib/domain/simulation/simulateOneDay';
import { FisheryClock } from '../src/lib/domain/simulation/elapsedDays';
import { ClassicSwims, classicCarp, classicLake, classicSwims } from '../src/lib/domain/sites/classicSite';
import { defaultRodSetup } from '../src/lib/domain/tackle/rodSetup';
import type { Carp, Lake, Swim } from '../src/lib/domain/types';
import { seasonFor } from '../src/lib/domain/world/seasons';
import { runMarketScenarios } from './testMarket';
import { runWorldScenarios } from './testWorld';

const random = seededRandom(42);
const start = new Date('2026-01-01T00:00:00Z');
const lake: Lake = { id: 'lake-1', ...classicLake('owner-1', 'Test Water', start) };
const carp: Carp[] = classicCarp(lake.id, random).map((fish, index) => ({ ...fish, id: `carp-${index}` }));
const swims: Swim[] = classicSwims(lake.id).map((swim, index) => ({ ...swim, id: `swim-${index}` }));

assert.equal(carp.length, 100);
assert.ok(carp.every((fish) => fish.weight_lb >= 10 && fish.weight_lb <= 15), 'classic carp are 10-15 lb');

for (const classic of ClassicSwims) {
	const swim = swims.find((candidate) => candidate.name === classic.name)!;
	const terrain = terrainInFrontOfSwim(lake, swim);
	assert.equal(terrain.bed, classic.bed, `${classic.name} keeps its bed`);
	assert.equal(terrain.depthFeet, classic.depthFeet, `${classic.name} keeps its depth`);
	assert.equal(terrain.feature, classic.feature, `${classic.name} keeps its feature`);
}

function contextForDay(dayIndex: number, currentLake: Lake): DayContext {
	const dayStart = new Date(start.getTime() + dayIndex * FisheryClock.RealMillisecondsPerFisheryDay);
	const dayEnd = new Date(dayStart.getTime() + FisheryClock.RealMillisecondsPerFisheryDay);
	return { dayStart, dayEnd, season: seasonFor(currentLake, dayStart), records: noRecordsYet() };
}

const fedLake: Lake = { ...lake, feed_stock: { ...lake.feed_stock, fishmeal_boilies: 40 } };
const day = simulateOneDay(fedLake, carp, swims, random, contextForDay(0, fedLake));
assert.ok(day.lake.feed_stock.fishmeal_boilies < 40, 'feed is eaten');
assert.ok(day.carp.some((fish, index) => fish.weight_lb > carp[index].weight_lb), 'fed carp grow');
assert.ok(day.visits.length >= 1, 'anglers visit');
assert.ok(day.feesCollected >= 0, 'fees are non-negative');
assert.ok(day.records.lakeRecordLb > 0, 'the first catches set a lake record');
console.log('day 1:', { anglers: day.visits.length, catches: day.catches.length, fees: day.feesCollected, reputation: day.lake.reputation });

let stateLake = day.lake;
let stateCarp = day.carp;
for (let dayNumber = 2; dayNumber <= 30; dayNumber++) {
	const outcome = simulateOneDay(stateLake, stateCarp, swims, random, contextForDay(dayNumber - 1, stateLake));
	stateLake = outcome.lake;
	stateCarp = outcome.carp;
}
console.log('day 30:', { silt: stateLake.silt, weed: stateLake.weed, transparency: stateLake.transparency, reputation: stateLake.reputation, carp: stateCarp.length });

const castTerrain = castTerrainFor(fedLake, { x: 0.5, y: 0.5 });
const match = matchTackleToWater(defaultRodSetup(), fedLake, castTerrain);
assert.ok(match.overall > 0.3 && match.overall <= 1, `sensible match ${match.overall}`);
const chance = biteChanceForOneHour(fedLake, match.overall, 60, 6);
assert.ok(chance > 0.05 && chance < 0.9, `sensible bite chance ${chance}`);
console.log('match:', match, 'bite chance at dawn for a 60-skill angler:', chance.toFixed(3));

runMarketScenarios();
runWorldScenarios();
console.log('domain tests passed');
