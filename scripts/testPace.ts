import assert from 'node:assert/strict';
import { oddsRows } from './pace/oddsTable';
import { diaryRows, endOfYearRows, firstLandedMedian, ladderRows, paceRows, playersOf, printTable, takingsRows } from './pace/report';
import { Milestones, PaceTargets } from './pace/rules';
import { buildWorld, simulateTheYear } from './pace/world';

const Seed = 2026;
const started = Date.now();
const world = buildWorld(Seed);
simulateTheYear(world);

printTable('The pace — median real day of the first fish of each size, landed by the player and swimming in their own water', ['player', 'n', 'lands a 20', 'lands a 30', 'lands a 40', 'lands a 50', 'owns a 30', 'owns a 40', 'owns a 50'], paceRows(world));
printTable('The end of the year — medians per player type', ['player', 'level', 'best lb', 'landed', 'lake rating', 'biggest owned lb', 'in the bank', 'stock value'], endOfYearRows(world));
printTable('A diary — the first player of each type, on the day', ['player', 'day', 'rating', 'in the bank', 'level', 'biggest owned lb', 'best landed lb'], diaryRows(world));
printTable('The world ladder — month by month', ['month', 'biggest fish lb', 'forties', 'fifties', 'top rating', 'died of old age'], ladderRows(world));
printTable('What a water earns per fishery day, by rating band (24 fishery days to a real day)', ['rating', 'lake-days', 'income', 'costs', 'net per fishery day', 'net per real day'], takingsRows(world));
printTable('The odds — the chance that the biggest fish on a prize water (100 doubles, 40 twenties, 8 thirties, two forties) is the one landed', ['who', 'k', 'per bite', 'per session', 'per five sessions'], oddsRows());

const regulars = playersOf(world, 'regular');
for (const milestone of Milestones) {
	const day = firstLandedMedian(regulars, milestone);
	const target = PaceTargets[milestone];
	assert.ok(day <= target.byDay, `a regular player lands a ${milestone} by day ${target.byDay}: median day ${day}`);
	assert.ok(day >= target.noSoonerThanDay, `a regular player does not land a ${milestone} before day ${target.noSoonerThanDay}: median day ${day}`);
}
console.log(`\npace: the regular player is on the table; ${world.players.length} players, ${world.fisheryDay} fishery days, ${((Date.now() - started) / 1000).toFixed(1)} s`);
