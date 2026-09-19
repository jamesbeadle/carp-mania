import assert from 'node:assert/strict';
import { fightSecondsFor, TensionBand, tensionBandFor } from '../src/lib/domain/fishing/fight';
import { landingRate } from './fightBot';
import { fightPatternOf, surgeAt } from '../src/lib/domain/fishing/fightPattern';
import { rodSnapChancePerSecond } from '../src/lib/domain/tackle/rods';

const LandingTargets = [
	{ weightLb: 20, line: 'medium', atLeast: 0.9 },
	{ weightLb: 30, line: 'medium', atLeast: 0.75 }
];
const AgreementWithinShare = 0.06;
const FastFrameSeconds = 0.016;
const SlowFrameSeconds = 0.05;

export function runFightScenarios() {
	assertTheBandWidensWithCraft();
	for (const target of LandingTargets) {
		const fast = landingRate(target.weightLb, FastFrameSeconds);
		const slow = landingRate(target.weightLb, SlowFrameSeconds);
		const fastPercent = Math.round(fast * 100);
		const slowPercent = Math.round(slow * 100);
		assert.ok(fast >= target.atLeast, `a competent hand lands a ${target.weightLb} on ${target.line} line ${fastPercent}% of the time at 16 ms`);
		assert.ok(Math.abs(fast - slow) <= AgreementWithinShare, `a slow phone (${slowPercent}%) fights the same fight as a fast desktop (${fastPercent}%)`);
	}
	assertTheRodSnaps();
	console.log('fight:', { thirtyLanded: landingRate(30, FastFrameSeconds).toFixed(2) });
}

const AllRoundRod = { testCurveLb: 2.75 as const };
const BigFishRod = { testCurveLb: 3 as const };
const SnapCases = { FortyFive: 45, Sixty: 60 } as const;

function assertTheRodSnaps() {
	const fortyFive = snapOddsOverAFight(SnapCases.FortyFive, rodSnapChancePerSecond(SnapCases.FortyFive, AllRoundRod));
	const sixty = snapOddsOverAFight(SnapCases.Sixty, rodSnapChancePerSecond(SnapCases.Sixty, AllRoundRod));
	assert.ok(fortyFive > 0.25 && fortyFive < 0.4, `a forty-five on a 2.75 is about one in three lost (${fortyFive.toFixed(2)})`);
	assert.ok(sixty > 0.6 && sixty < 0.78, `a sixty on a 2.75 is about two in three lost (${sixty.toFixed(2)})`);
	assert.equal(rodSnapChancePerSecond(SnapCases.FortyFive, BigFishRod), 0, 'a forty-five never snaps a 3 lb rod');
}

function snapOddsOverAFight(weightLb: number, chancePerSecond: number) {
	return 1 - Math.pow(1 - chancePerSecond, fightSecondsFor(weightLb));
}

function assertTheBandWidensWithCraft() {
	const novice = tensionBandFor(0);
	const expert = tensionBandFor(100);
	assert.deepEqual(novice, { slackBelow: TensionBand.SlackBelow, snapAbove: TensionBand.SnapAbove }, 'a novice fights inside the standard band');
	const isWider = expert.snapAbove > novice.snapAbove && expert.slackBelow < novice.slackBelow;
	assert.ok(isWider, 'craft widens the band');
	const pattern = fightPatternOf({ id: 'carp-9' });
	assert.deepEqual(fightPatternOf({ id: 'carp-9' }), pattern, 'a fish fights the same way every time');
	assert.ok(surgeAt(pattern, 1) >= -0.1 && surgeAt(pattern, 1) <= 1.1, 'the surge stays in its range');
}
