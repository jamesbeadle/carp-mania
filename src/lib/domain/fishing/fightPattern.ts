import { stableHash } from '../layout/favouriteFeature';
import type { Carp } from '../types';

export interface FightPattern {
	slowPhase: number;
	slowRate: number;
	quickRate: number;
}

const Slow = { LowestRate: 0.7, RateRange: 0.5, Weight: 0.5 } as const;
const Quick = { LowestRate: 2.2, RateRange: 1.2, Weight: 0.1 } as const;
const FullCircle = Math.PI * 2;
const MidSurge = 0.5;
const Hundredths = 100;
const PatternSalt = 'fight-pattern';

export function fightPatternOf(carp: Pick<Carp, 'id'>): FightPattern {
	const hash = stableHash(carp.id + PatternSalt);
	const phaseShare = (hash % Hundredths) / Hundredths;
	const slowShare = (Math.floor(hash / Hundredths) % Hundredths) / Hundredths;
	const quickShare = (Math.floor(hash / (Hundredths * Hundredths)) % Hundredths) / Hundredths;
	return {
		slowPhase: phaseShare * FullCircle,
		slowRate: Slow.LowestRate + slowShare * Slow.RateRange,
		quickRate: Quick.LowestRate + quickShare * Quick.RateRange
	};
}

export function surgeAt(pattern: FightPattern, timeSeconds: number) {
	const slowAngle = timeSeconds * pattern.slowRate + pattern.slowPhase;
	const slowSwell = Math.sin(slowAngle) * Slow.Weight;
	const quickSwell = Math.sin(timeSeconds * pattern.quickRate) * Quick.Weight;
	return MidSurge + slowSwell + quickSwell;
}
