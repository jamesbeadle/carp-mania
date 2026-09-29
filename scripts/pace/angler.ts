import { Tiers, type Tier } from '../../src/lib/domain/tackle/brands';
import { TierTackleShare } from '../../src/lib/domain/simulation/visitorTake';
import { Experience, Milestones, TierAtLevel, type MilestoneLb } from './rules';

export interface Angler {
	level: number;
	experience: number;
	tier: Tier;
	personalBestLb: number;
	fishLanded: number;
	sessionsByLake: Map<number, number>;
	firstLandedDay: Map<MilestoneLb, number>;
}

export function newAngler(): Angler {
	return { level: 0, experience: 0, tier: 'starter', personalBestLb: 0, fishLanded: 0, sessionsByLake: new Map(), firstLandedDay: new Map() };
}

export function sessionsOn(angler: Angler, lakeId: number) {
	return angler.sessionsByLake.get(lakeId) ?? 0;
}

export function experienceForCatch(weightLb: number, sessionsHere: number, isPersonalBest: boolean) {
	const novelty = 1 / (1 + sessionsHere / Experience.NoveltyHalfSessions);
	const personalBestFactor = isPersonalBest ? Experience.PersonalBestFactor : 1;
	return Math.pow(weightLb, Experience.WeightPower) * novelty * personalBestFactor;
}

export function levelFor(experience: number) {
	return Math.floor(Math.pow(experience / Experience.LevelCost, 1 / Experience.LevelPower));
}

export function experienceForLevel(level: number) {
	return Experience.LevelCost * Math.pow(level, Experience.LevelPower);
}

export function tierUnlockedAt(level: number): Tier {
	return [...Tiers].reverse().find((tier) => level >= TierAtLevel[tier]) ?? 'starter';
}

export function tackleShareOf(angler: Angler) {
	return TierTackleShare[angler.tier];
}

export function earnExperience(angler: Angler, amount: number) {
	angler.experience += amount;
	angler.level = levelFor(angler.experience);
}

export function noteLanded(angler: Angler, weightLb: number, realDay: number) {
	angler.fishLanded += 1;
	for (const milestone of Milestones) {
		const isFirstOfItsKind = weightLb >= milestone && !angler.firstLandedDay.has(milestone);
		if (isFirstOfItsKind) angler.firstLandedDay.set(milestone, realDay);
	}
	angler.personalBestLb = Math.max(angler.personalBestLb, weightLb);
}

export function noteSession(angler: Angler, lakeId: number) {
	angler.sessionsByLake.set(lakeId, sessionsOn(angler, lakeId) + 1);
}
