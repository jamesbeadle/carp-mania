import { carpPullStrength, easedChange, fightSecondsFor, FightStepSeconds, isFishRunning, isHookPulled, isLineSnapped, nextTension, RunWarningSeconds, TensionBand, tensionBandFor, tensionChangePerSecond, type Band } from '../src/lib/domain/fishing/fight';
import { fightPatternOf, surgeAt, type FightPattern } from '../src/lib/domain/fishing/fightPattern';

const FightsPerCase = 400;
const CompetentReactionSeconds = 0.25;
const HoldsUpTo = 0.1;
const MediumLineStrainLb = 15;
const CompetentRating = 50;

interface Hand {
	reactionSeconds: number;
}

interface FightInPlay {
	pattern: FightPattern;
	band: Band;
	pull: number;
	tension: number;
	secondsLeft: number;
	time: number;
	previousChange: number;
	isReeling: boolean;
}

export function landingRate(weightLb: number, frameSeconds: number) {
	let landed = 0;
	for (let fight = 0; fight < FightsPerCase; fight++) landed += playOneFight(`fish-${fight}`, weightLb, frameSeconds, { reactionSeconds: CompetentReactionSeconds }) ? 1 : 0;
	return landed / FightsPerCase;
}

function playOneFight(fishId: string, weightLb: number, frameSeconds: number, hand: Hand) {
	const fight: FightInPlay = {
		pattern: fightPatternOf({ id: fishId }),
		band: tensionBandFor(CompetentRating),
		pull: carpPullStrength(weightLb, MediumLineStrainLb),
		tension: TensionBand.Ideal,
		secondsLeft: fightSecondsFor(weightLb),
		time: 0,
		previousChange: 0,
		isReeling: false
	};
	let unstepped = 0;
	while (fight.secondsLeft > 0) {
		fight.isReeling = handDecides(fight, fight.time - hand.reactionSeconds);
		unstepped += frameSeconds;
		while (unstepped >= FightStepSeconds) {
			unstepped -= FightStepSeconds;
			if (!stepTheFight(fight)) return false;
		}
	}
	return true;
}

function stepTheFight(fight: FightInPlay) {
	fight.time += FightStepSeconds;
	const surge = surgeAt(fight.pattern, fight.time);
	const change = easedChange(fight.previousChange, tensionChangePerSecond(fight.isReeling, fight.pull, surge));
	fight.previousChange = change;
	fight.tension = nextTension(fight.tension, change, FightStepSeconds);
	fight.secondsLeft -= FightStepSeconds;
	return !isLineSnapped(fight.tension, fight.band) && !isHookPulled(fight.tension, fight.band);
}

function handDecides(fight: FightInPlay, perceivedTime: number) {
	const seen = Math.max(0, perceivedTime);
	const isRunning = isFishRunning(surgeAt(fight.pattern, seen));
	const isRunComing = isFishRunning(surgeAt(fight.pattern, seen + RunWarningSeconds));
	if (isRunning || isRunComing) return false;
	return fight.tension < TensionBand.Ideal + HoldsUpTo;
}
