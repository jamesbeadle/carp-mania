import { baitEffects } from './effects/baitEffects';
import { hookEffects, lineEffects, rigEffects } from './effects/endTackleEffects';
import type { ItemEffect } from './effects/itemEffect';
import { reelEffects, rodEffects } from './effects/rodAndReelEffects';
import type { TackleItem } from './tackleItem';
import { TubingLabels } from './tubing';

export type { ItemEffect } from './effects/itemEffect';

const NoEffects: ItemEffect[] = [];
const LeadWords = 'Leads for every rig — one goes out with every rig and stays in the snag with it';

export function itemEffectsOf(item: TackleItem): ItemEffect[] {
	if (item.kind === 'rod') return rodEffects(item);
	if (item.kind === 'reel') return reelEffects(item);
	if (item.kind === 'line') return lineEffects(item);
	if (item.kind === 'hook') return hookEffects(item);
	if (item.kind === 'rig') return rigEffects(item);
	if (item.kind === 'bait') return baitEffects(item);
	return NoEffects;
}

export function itemWordsOf(item: TackleItem): string {
	if (item.kind === 'tubing') return TubingLabels[item.tubing];
	if (item.kind === 'lead') return LeadWords;
	return itemEffectsOf(item).map((one) => one.words).join(' · ');
}

export interface EffectDifference {
	label: string;
	percent: number;
}

const DifferencesShown = 2;
const NoDifference = 0;

export function differencesFrom(item: TackleItem, inUse: TackleItem | null): EffectDifference[] {
	if (!inUse || inUse.kind !== item.kind) return [];
	const current = new Map(itemEffectsOf(inUse).map((one) => [one.key, one.share]));
	const differences = itemEffectsOf(item)
		.filter((one) => current.has(one.key))
		.map((one) => ({ label: one.label, percent: Math.round((one.share - (current.get(one.key) ?? 0)) * 100) }))
		.filter((one) => one.percent !== NoDifference);
	return differences.sort((first, second) => Math.abs(second.percent) - Math.abs(first.percent)).slice(0, DifferencesShown);
}
