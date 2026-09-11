import assert from 'node:assert/strict';
import { biteChanceForOneHour } from '../src/lib/domain/fishing/biteChance';
import { matchTackleToWater } from '../src/lib/domain/fishing/tackleMatch';
import { seededRandom } from '../src/lib/domain/random';
import { simulateOneDay } from '../src/lib/domain/simulation/simulateOneDay';
import { starterCarp, starterLake, starterSwims } from '../src/lib/domain/starterFishery';
import { defaultRodSetup } from '../src/lib/domain/tackle/rodSetup';
import type { Carp, Lake, Swim } from '../src/lib/domain/types';

const random = seededRandom(42);
const lake: Lake = { id: 'lake-1', ...starterLake('owner-1', 'Test Water', new Date('2026-01-01')) };
const carp: Carp[] = starterCarp(lake.id, random).map((fish, index) => ({ ...fish, id: `carp-${index}` }));
const swims: Swim[] = starterSwims(lake.id).map((swim, index) => ({ ...swim, id: `swim-${index}` }));

assert.equal(carp.length, 100);
assert.ok(carp.every((fish) => fish.weight_lb >= 10 && fish.weight_lb <= 15), 'starter carp are 10-15 lb');

const fedLake: Lake = { ...lake, feed_stock: { ...lake.feed_stock, fishmeal_boilies: 40 } };
const day = simulateOneDay(fedLake, carp, swims, random);
assert.ok(day.lake.feed_stock.fishmeal_boilies < 40, 'feed is eaten');
assert.ok(day.carp.some((fish, index) => fish.weight_lb > carp[index].weight_lb), 'fed carp grow');
assert.ok(day.visits.length >= 1, 'anglers visit');
assert.ok(day.feesCollected >= 0, 'fees are non-negative');
console.log('day 1:', { anglers: day.visits.length, catches: day.catches.length, fees: day.feesCollected, reputation: day.lake.reputation });

let stateLake = day.lake;
let stateCarp = day.carp;
for (let dayNumber = 2; dayNumber <= 30; dayNumber++) {
	const outcome = simulateOneDay(stateLake, stateCarp, swims, random);
	stateLake = outcome.lake;
	stateCarp = outcome.carp;
}
console.log('day 30:', { silt: stateLake.silt, weed: stateLake.weed, transparency: stateLake.transparency, reputation: stateLake.reputation, carp: stateCarp.length });

const match = matchTackleToWater(defaultRodSetup(), fedLake, swims[0]);
assert.ok(match.overall > 0.3 && match.overall <= 1, `sensible match ${match.overall}`);
const chance = biteChanceForOneHour(fedLake, match.overall, 60, 6);
assert.ok(chance > 0.05 && chance < 0.9, `sensible bite chance ${chance}`);
console.log('match:', match, 'bite chance at dawn for a 60-skill angler:', chance.toFixed(3));
console.log('domain tests passed');
