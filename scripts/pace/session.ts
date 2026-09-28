import type { RandomFraction } from '../../src/lib/domain/random';
import { earnExperience, experienceForCatch, noteLanded, noteSession, sessionsOn, tackleShareOf, type Angler } from './angler';
import { clampShare, poisson } from './draws';
import { rememberCapture, type Fish } from './fish';
import { biggestLb, type Lake } from './lake';
import { cumulativeTakeWeights, drawTaker, takeExponentFor } from './odds';
import { Bites, Experience, Fame, Odds } from './rules';
import type { SeasonToday } from './visitors';

export interface Records {
	worldLb: number;
}

export interface SessionDay {
	today: number;
	realDay: number;
	season: SeasonToday;
	records: Records;
	random: RandomFraction;
}

export function fishOneSession(angler: Angler, lake: Lake, day: SessionDay) {
	const sessionsHere = sessionsOn(angler, lake.id);
	const isFirstVisit = sessionsHere === 0;
	if (isFirstVisit) earnExperience(angler, Experience.NewWater);
	const tackleShare = tackleShareOf(angler);
	const exponent = takeExponentFor(lake.rating, angler.level, sessionsHere, tackleShare);
	const bites = Math.min(Bites.MostPerSession, poisson(bitesMeanFor(angler, tackleShare, day.season), day.random));
	const landed = playTheBites(bites, angler, lake, day, exponent, tackleShare, sessionsHere);
	noteSession(angler, lake.id);
	earnExperience(angler, Experience.PerSession);
	lake.today.anglers += 1;
	lake.today.landed += landed;
	return landed;
}

function playTheBites(bites: number, angler: Angler, lake: Lake, day: SessionDay, exponent: number, tackleShare: number, sessionsHere: number) {
	if (lake.fish.length === 0) return 0;
	const cumulative = cumulativeTakeWeights(lake.fish, exponent, biggestLb(lake), day.today);
	let landed = 0;
	for (let bite = 0; bite < bites; bite++) {
		const fish = lake.fish[drawTaker(cumulative, day.random())];
		const isLanded = day.random() < landChanceFor(fish.weightLb, tackleShare);
		if (!isLanded) continue;
		land(fish, angler, lake, day, sessionsHere);
		landed += 1;
	}
	return landed;
}

function bitesMeanFor(angler: Angler, tackleShare: number, season: SeasonToday) {
	const levelShare = Math.min(1, angler.level / Odds.LevelForFullPull);
	const craft = 1 - Bites.LevelSwing + Bites.LevelSwing * levelShare;
	const tackle = 1 - Bites.TackleSwing + Bites.TackleSwing * tackleShare;
	return Bites.PerSession * craft * tackle * season.bite;
}

export function landChanceFor(weightLb: number, tackleShare: number) {
	const bigness = clampShare((weightLb - Bites.BigFishFromLb) / Bites.BigFishSpanLb);
	return Bites.HookHold * (Bites.FightWon - Bites.BigFishFightLoss * bigness * (1 - tackleShare));
}

function land(fish: Fish, angler: Angler, lake: Lake, day: SessionDay, sessionsHere: number) {
	const isPersonalBest = fish.weightLb > angler.personalBestLb;
	earnExperience(angler, experienceForCatch(fish.weightLb, sessionsHere, isPersonalBest));
	noteLanded(angler, fish.weightLb, day.realDay);
	rememberCapture(fish, day.today);
	fish.fame += Fame.PlayerCatch + (isPersonalBest ? Fame.PersonalBest : 0);
	const isLakeRecord = fish.weightLb > lake.recordLb;
	if (isLakeRecord) lake.recordLb = fish.weightLb;
	if (isLakeRecord) fish.fame += Fame.LakeRecord;
	const isWorldRecord = fish.weightLb > day.records.worldLb;
	if (isWorldRecord) day.records.worldLb = fish.weightLb;
	if (isWorldRecord) fish.fame += Fame.WorldRecord;
}
