export type HookSize = 2 | 4 | 6;
export type HookFinish = 'matt' | 'shiny';
export type Barb = 'barbed' | 'micro' | 'barbless';

export interface HookStats {
	size: HookSize;
	finish: HookFinish;
	barb: Barb;
	straightensAboveLb: number;
	snapsAboveLb: number;
}

export const HookSizes: HookSize[] = [6, 4, 2];
export const HookFinishes: HookFinish[] = ['matt', 'shiny'];
export const Barbs: Barb[] = ['barbed', 'micro', 'barbless'];

export const HookHoldChance: Record<HookSize, number> = { 6: 0.85, 4: 0.92, 2: 0.96 };
export const HookBiteAppeal: Record<HookSize, number> = { 6: 1, 4: 1, 2: 0.85 };
export const BarbHold: Record<Barb, number> = { barbed: 1, micro: 0.97, barbless: 0.86 };
export const BarblessMasteredAtRating = 70;
export const BarbLabels: Record<Barb, string> = { barbed: 'Barbed', micro: 'Micro-barbed', barbless: 'Barbless' };
export const NeverStraightensLb = Number.POSITIVE_INFINITY;

export const ShinyHookByAge = { DrawnUnderYears: 8, SpookedOverYears: 15, DrawnFactor: 1.15, SpookedFactor: 0.8 } as const;

export const HookSizeNote: Record<HookSize, string> = {
	2: 'Big and strong — holds anything, but heavy for a wary fish',
	4: 'The all-round carp hook',
	6: 'Neat and light, still holds well'
};

export function barbHoldFor(barb: Barb, rating: number) {
	const isMastered = barb === 'barbless' && rating >= BarblessMasteredAtRating;
	return isMastered ? BarbHold.barbed : BarbHold[barb];
}

export function hookHoldChance(hook: Pick<HookStats, 'size' | 'barb'>, rating: number) {
	return HookHoldChance[hook.size] * barbHoldFor(hook.barb, rating);
}

export const HookOpening = { ChancePerShareOverTheLimit: 3, MostChance: 0.6 } as const;

export function hookOpeningChance(hook: Pick<HookStats, 'straightensAboveLb'>, fishLb: number) {
	const isWithinTheLimit = fishLb <= hook.straightensAboveLb;
	if (isWithinTheLimit) return 0;
	const shareOverTheLimit = (fishLb - hook.straightensAboveLb) / hook.straightensAboveLb;
	return Math.min(HookOpening.MostChance, shareOverTheLimit * HookOpening.ChancePerShareOverTheLimit);
}

export function doesHookOpen(hook: Pick<HookStats, 'straightensAboveLb'>, fishLb: number, roll: number) {
	return roll < hookOpeningChance(hook, fishLb);
}

export function doesHookSnap(hook: Pick<HookStats, 'snapsAboveLb'>, fishLb: number) {
	return fishLb > hook.snapsAboveLb;
}

export function shinyHookFactor(ageYears: number, transparencyShare: number) {
	const drawn = ageYears < ShinyHookByAge.DrawnUnderYears ? ShinyHookByAge.DrawnFactor : 1;
	const spooked = ageYears > ShinyHookByAge.SpookedOverYears ? ShinyHookByAge.SpookedFactor : 1;
	const clearWaterFactor = drawn * spooked;
	return 1 + (clearWaterFactor - 1) * transparencyShare;
}
