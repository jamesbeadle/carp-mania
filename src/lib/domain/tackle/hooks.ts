export type HookSize = 2 | 4 | 6 | 8;
export type HookFinish = 'matt' | 'shiny';

export interface HookChoice {
	size: HookSize;
	finish: HookFinish;
}

export const HookSizes: HookSize[] = [2, 4, 6, 8];
export const HookFinishes: HookFinish[] = ['matt', 'shiny'];

export const HookHoldChance: Record<HookSize, number> = { 2: 0.95, 4: 0.92, 6: 0.85, 8: 0.55 };
export const HookBiteAppeal: Record<HookSize, number> = { 2: 0.8, 4: 1, 6: 1, 8: 0.9 };
export const ShinyHookVisibility = 0.5;

export const HookSizeNote: Record<HookSize, string> = {
	2: 'Big and strong — holds anything, but heavy for a wary fish',
	4: 'The all-round carp hook',
	6: 'Neat and light, still holds well',
	8: 'Really too small for carp — expect dropped fish'
};
