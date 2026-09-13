import assert from 'node:assert/strict';
import type { BoardNeighbour, MyRival } from '../src/lib/contracts/Rivalry';
import { chaserLine, placeLine, toBeatLine } from '../src/lib/domain/world/rivalWords';

export function runRivalryScenarios() {
	const neighbour = (displayName: string, bestLb: number, rank: number): BoardNeighbour => ({ anglerId: displayName.toLowerCase(), displayName, avatarUrl: null, bestLb, rank });
	const rival = (bestLb: number, rank: number, above: BoardNeighbour | null, below: BoardNeighbour | null): MyRival => ({ standing: { bestLb, rank, anglers: 37 }, above, below });

	const chasing = rival(24.5, 5, neighbour('Priya', 28, 4), neighbour('Sam', 22.25, 6));
	assert.equal(toBeatLine(chasing), '3 lb 8 oz to beat.');
	assert.equal(chaserLine(chasing), 'Sam is 2 lb 4 oz behind you.');
	assert.equal(placeLine(chasing.above!), 'No. 4 · 28 lb');

	const top = rival(41.125, 1, null, neighbour('Priya', 39, 2));
	assert.equal(toBeatLine(top), 'The best fish by any angler is yours — 41 lb 2 oz. Hold it.');
	assert.equal(chaserLine(top), 'Priya is 2 lb 2 oz behind you.');

	const alone = rival(30, 1, null, null);
	assert.equal(chaserLine(alone), null, 'nobody behind means no chaser line');

	const newcomer = rival(0, 38, neighbour('Ash', 6.5, 37), null);
	assert.equal(toBeatLine(newcomer), 'Your first fish puts you on the ladder. Ash holds the last rung with 6 lb 8 oz.');
	assert.equal(chaserLine(newcomer), null);

	assert.match(toBeatLine(rival(0, 1, null, null)), /Nothing on the bank anywhere yet/, 'an empty world board is an open door');
	console.log('rivalry:', { toBeat: toBeatLine(chasing) });
}
