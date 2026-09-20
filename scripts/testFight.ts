import assert from 'node:assert/strict';
import { carpPullStrength, easedChange, fightSecondsFor, FightStepSeconds, isFishRunning, isHookPulled, isLineSnapped, nextTension, RunWarningSeconds, TensionBand, tensionBandFor, tensionChangePerSecond } from '../src/lib/domain/fishing/fight';
import { fightPatternOf, surgeAt } from '../src/lib/domain/fishing/fightPattern';
import type { LineThickness } from '../src/lib/domain/tackle/lines';

const FightsPerCase = 400;
const CompetentReactionSeconds = 0.25;
const LandingTargets: { weightLb: number; line: LineThickness; atLeast: number }[] = [
	{ weightLb: 20, line: 'medium', atLeast: 0.9 },
	{ weightLb: 30, line: 'medium', atLeast: 0.75 }
];
const AgreementWithinShare = 0.06;
const FastFrameSeconds = 0.016;
const SlowFrameSeconds = 0.05;
const HoldsUpTo = 0.1;

interface Hand {
	reactionSeconds: number;
}

export function runFightScenarios() {
	assertTheBandWidensWithCraft();
	for (const target of LandingTargets) {
		const fast = landingRate(target.weightLb, target.line, FastFrameSeconds);
		const slow = landingRate(target.weightLb, target.line, SlowFrameSeconds);
		const fastPercent = Math.round(fast * 100);
		const slowPercent = Math.round(slow * 100);
		assert.ok(fast >= target.atLeast, `a competent hand lands a ${target.weightLb} on ${target.line} line ${fastPercent}% of the time at 16 ms`);
		assert.ok(Math.abs(fast - slow) <= AgreementWithinShare, `a slow phone (${slowPercent}%) fights the same fight as a fast desktop (${fastPercent}%)`);
	}
	console.log('fight:', { thirtyLanded: landingRate(30, 'medium', FastFrameSeconds).toFixed(2) });
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

function landingRate(weightLb: number, line: LineThickness, frameSeconds: number) {
	let landed = 0;
	for (let fight = 0; fight < FightsPerCase; fight++) landed += playOneFight({ id: `fish-${fight}` }, weightLb, line, frameSeconds, { reactionSeconds: CompetentReactionSeconds }) ? 1 : 0;
	return landed / FightsPerCase;
}

function playOneFight(fish: { id: string }, weightLb: number, line: LineThickness, frameSeconds: number, hand: Hand) {
	const band = tensionBandFor(50);
	const pattern = fightPatternOf(fish);
	const pull = carpPullStrength(weightLb, line);
	let tension = TensionBand.Ideal;
	let secondsLeft = fightSecondsFor(weightLb);
	let time = 0;
	let unstepped = 0;
	let previousChange = 0;
	let isReeling = false;
	while (secondsLeft > 0) {
		isReeling = handDecides(pattern, time - hand.reactionSeconds, tension);
		unstepped += frameSeconds;
		while (unstepped >= FightStepSeconds) {
			unstepped -= FightStepSeconds;
			time += FightStepSeconds;
			const surge = surgeAt(pattern, time);
			const change = easedChange(previousChange, tensionChangePerSecond(isReeling, pull, surge));
			previousChange = change;
			tension = nextTension(tension, change, FightStepSeconds);
			secondsLeft -= FightStepSeconds;
			if (isLineSnapped(tension, band) || isHookPulled(tension, band)) return false;
		}
	}
	return true;
}

function handDecides(pattern: ReturnType<typeof fightPatternOf>, perceivedTime: number, tension: number) {
	const isRunning = isFishRunning(surgeAt(pattern, Math.max(0, perceivedTime)));
	const isRunComing = isFishRunning(surgeAt(pattern, Math.max(0, perceivedTime) + RunWarningSeconds));
	if (isRunning || isRunComing) return false;
	return tension < TensionBand.Ideal + HoldsUpTo;
}
