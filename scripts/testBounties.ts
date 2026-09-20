import assert from 'node:assert/strict';
import { BountyDraw, drawBountyFor, isBountyDrawnToday, theLineFor } from '../src/lib/domain/bounties/bountyDraw';
import { isSettledOnTheSpot } from '../src/lib/domain/bounties/bountyKinds';
import { difficultyBandOf } from '../src/lib/domain/bounties/difficultyBand';
import { drawPrize, prizeMoneyFor } from '../src/lib/domain/bounties/prizeTackle';
import { isTakenBy, winnerOf, type CatchInTheWindow, type OpenBounty } from '../src/lib/domain/bounties/settle';
import { seededRandom } from '../src/lib/domain/random';
import { prototypeItem, prototypeItemId } from '../src/lib/domain/tackle/prototypes';
import { landsUpToLb } from '../src/lib/domain/tackle/rods';
import { tillReceiptFor } from '../src/lib/domain/tackle/sponsorship';

const dayStart = new Date('2026-09-19T00:00:00Z');
const MillisecondsInAnHour = 60 * 60 * 1000;

function fish(id: string, weightLb: number) {
	return { id, name: id, weight_lb: weightLb, strain: 'mirror' as const, condition: 80, fame: 0, is_catalogued: true };
}

export function runBountyScenarios() {
	assert.equal(difficultyBandOf({ kind: 'top_of_the_water', targetWeightLb: null }, { bestLb: 22, fishOverLine: 1 }), 'easy', 'top of a water whose best is a twenty is easy');
	assert.equal(difficultyBandOf({ kind: 'over_the_line', targetWeightLb: 40 }, { bestLb: 44, fishOverLine: 2 }), 'very_hard', 'over the line at forty with two forties is very hard');
	assert.equal(difficultyBandOf({ kind: 'named_fish', targetWeightLb: 30 }, { bestLb: 38, fishOverLine: 1 }), 'hard', 'a named thirty is one step harder than the water');
	assert.equal(prizeMoneyFor(700), 500, 'about five hundred on a small water');
	assert.equal(prizeMoneyFor(50000), 7900, 'nearly eight thousand on a great one');
	assert.ok(isSettledOnTheSpot('named_fish') && !isSettledOnTheSpot('top_of_the_water'));
	const water = [fish('a', 44), fish('b', 41), fish('c', 28), fish('d', 12)];
	assert.equal(theLineFor(water), 35, 'the line sits at 85% of the best, rounded to five');
	drawEveryKind(water);
	settleTheWindow();
	prizeTackle();
}

function drawEveryKind(water: ReturnType<typeof fish>[]) {
	const random = seededRandom(19);
	const kinds = new Set<string>();
	let drawnDays = 0;
	for (let day = 0; day < 4000; day++) {
		if (!isBountyDrawnToday(random)) continue;
		drawnDays++;
		const bounty = drawBountyFor(water, [{ id: 'peg-1', name: 'The Point' }], random, dayStart);
		assert.ok(bounty, 'a water with fish and pegs always draws a bounty');
		kinds.add(bounty.kind);
		const windowDays = (bounty.endsAt.getTime() - bounty.opensAt.getTime()) / MillisecondsInAnHour;
		assert.ok(windowDays >= BountyDraw.ShortestWindowDays && windowDays <= BountyDraw.LongestWindowDays, 'two to six fishery days');
		if (bounty.kind === 'peg_prize') assert.equal(bounty.swimName, 'The Point');
		const { targetCarpId, targetWeightLb } = bounty;
		if (bounty.kind === 'named_fish') assert.ok(targetCarpId && (targetWeightLb ?? 0) >= 20, 'a named fish is a catalogued twenty or more');
	}
	const share = drawnDays / 4000;
	assert.ok(share > 0.03 && share < 0.05, `about one day in twenty-five draws a bounty (${share})`);
	assert.equal(kinds.size, 5, 'every kind of bounty is drawn in time');
	console.log('bounties:', { shareOfDays: share.toFixed(3), kinds: kinds.size });
}

function settleTheWindow() {
	const bounty: OpenBounty = { kind: 'top_of_the_water', swimName: null, targetCarpId: null, targetWeightLb: null, opensAt: '2026-09-19T00:00:00Z', endsAt: '2026-09-21T00:00:00Z' };
	const landed = (anglerId: string, weightLb: number, caughtAt: string, swimName = 'The Point'): CatchInTheWindow => ({ anglerId, carpId: null, weightLb, swimName, caughtAt });
	const catches = [landed('ann', 30, '2026-09-19T10:00:00Z'), landed('bob', 34, '2026-09-20T10:00:00Z'), landed('cat', 40, '2026-09-22T10:00:00Z'), landed('ann', 20, '2026-09-19T12:00:00Z', 'The Bay')];
	assert.equal(winnerOf(bounty, catches)?.anglerId, 'bob', 'the forty came after the window closed');
	assert.equal(winnerOf({ ...bounty, kind: 'hard_graft' }, catches)?.anglerId, 'ann', 'hard graft is about numbers');
	assert.equal(winnerOf({ ...bounty, kind: 'peg_prize', swimName: 'The Bay' }, catches)?.anglerId, 'ann', 'the peg prize reads the swim');
	assert.equal(winnerOf(bounty, []), null, 'no catches, no winner');
	const named: OpenBounty = { ...bounty, kind: 'named_fish', targetCarpId: 'bertha' };
	assert.ok(isTakenBy(named, { ...landed('ann', 30, '2026-09-19T10:00:00Z'), carpId: 'bertha' }) && !isTakenBy(named, landed('ann', 30, '2026-09-19T10:00:00Z')));
	assert.ok(isTakenBy({ ...bounty, kind: 'over_the_line', targetWeightLb: 35 }, landed('ann', 35, '2026-09-19T10:00:00Z')), 'over the line is first to the weight');
}

function prizeTackle() {
	const random = seededRandom(7);
	const kinds = new Set<string>();
	for (let draw = 0; draw < 600; draw++) kinds.add(drawPrize('very_hard', 'blackmere', 1000, random).kind);
	const hasTheBigPrizes = kinds.has('prototype') && kinds.has('stocked_fish') && kinds.has('money');
	assert.ok(hasTheBigPrizes && !kinds.has('hooks_tin'), 'the hardest band pays in prototypes, stocked fish or money');
	const rod = prototypeItem(prototypeItemId('blackmere-prototype-rod', 7));
	assert.ok(rod && rod.kind === 'rod' && rod.label === 'Blackmere Prototype No. 7', 'a prototype is numbered');
	assert.equal(rod.kind === 'rod' ? landsUpToLb(rod.rod) : 0, 62, 'and lands sixty-two');
	assert.equal(prototypeItem('blackmere-rod-3-12'), null, 'a shop rod is not a prototype');
	const sponsored = [{ brand: 'halcyon' as const, runsUntil: '2027-01-01T00:00:00Z' }];
	const receipt = tillReceiptFor({ brand: 'halcyon', price: 100 }, 2, sponsored, [{ brand: 'halcyon', amount: 50 }], dayStart);
	assert.deepEqual(receipt, { price: 120, fromCredit: 50, fromPocket: 70, isSponsored: true }, 'sponsored is 40% off and brand credit goes first');
	const plain = tillReceiptFor({ brand: 'marlow', price: 100 }, 1, sponsored, [], dayStart);
	assert.deepEqual(plain, { price: 100, fromCredit: 0, fromPocket: 100, isSponsored: false });
}
