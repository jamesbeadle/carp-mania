import type { BountyKind } from './bountyKinds';

export type DifficultyBand = 'easy' | 'moderate' | 'hard' | 'very_hard';

export interface BountyAsk {
	kind: BountyKind;
	targetWeightLb: number | null;
}

export interface WaterHeld {
	bestLb: number;
	fishOverLine: number;
}

export const DifficultyBands: DifficultyBand[] = ['easy', 'moderate', 'hard', 'very_hard'];
export const BandLabels: Record<DifficultyBand, string> = { easy: 'Easy', moderate: 'Moderate', hard: 'Hard', very_hard: 'Very hard' };

const TopOfTheWater = { EasyBelowLb: 25, ModerateBelowLb: 35, HardBelowLb: 45 } as const;
const OverTheLine = { EasyFromFish: 10, ModerateFromFish: 5, HardFromFish: 3 } as const;
const PegPrizeHardFromLb = 35;
const OneStepHarder = 1;

export function difficultyBandOf(ask: BountyAsk, held: WaterHeld): DifficultyBand {
	if (ask.kind === 'hard_graft') return 'easy';
	if (ask.kind === 'peg_prize') return held.bestLb >= PegPrizeHardFromLb ? 'moderate' : 'easy';
	if (ask.kind === 'over_the_line') return bandForTheLine(held.fishOverLine);
	if (ask.kind === 'named_fish') return harderBy(bandForBestFish(ask.targetWeightLb ?? held.bestLb), OneStepHarder);
	return bandForBestFish(held.bestLb);
}

function bandForBestFish(bestLb: number): DifficultyBand {
	if (bestLb < TopOfTheWater.EasyBelowLb) return 'easy';
	if (bestLb < TopOfTheWater.ModerateBelowLb) return 'moderate';
	if (bestLb < TopOfTheWater.HardBelowLb) return 'hard';
	return 'very_hard';
}

function bandForTheLine(fishOverLine: number): DifficultyBand {
	if (fishOverLine >= OverTheLine.EasyFromFish) return 'easy';
	if (fishOverLine >= OverTheLine.ModerateFromFish) return 'moderate';
	if (fishOverLine >= OverTheLine.HardFromFish) return 'hard';
	return 'very_hard';
}

function harderBy(band: DifficultyBand, steps: number): DifficultyBand {
	const index = Math.min(DifficultyBands.length - 1, DifficultyBands.indexOf(band) + steps);
	return DifficultyBands[index];
}

export function isDifficultyBand(value: unknown): value is DifficultyBand {
	return (DifficultyBands as string[]).includes(value as string);
}
