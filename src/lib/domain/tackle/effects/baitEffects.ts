import { BaitCatalogue } from '../baits';
import { PresentationLabels } from '../presentations';
import type { BaitItem } from '../tackleItem';
import { effect, type ItemEffect } from './itemEffect';

const Scale = { MostAppeal: 1.3, KeepsForeverDays: 30 } as const;

export function baitEffects(item: BaitItem): ItemEffect[] {
	const profile = BaitCatalogue[item.bait.kind];
	const appeal = profile.appeal * item.bait.appealFactor;
	const keepsDays = item.bait.keepsDays;
	const keepsWords = keepsDays === null ? 'keeps for good' : `keeps ${keepsDays} fishery days`;
	const presentation = PresentationLabels[profile.presentation].toLowerCase();
	return [
		effect('appeal', appeal / Scale.MostAppeal, `appeal ×${appeal.toFixed(2)} as a ${presentation} — ${profile.note.toLowerCase()}`),
		effect('natural', profile.naturalAppeal, 'how much a fish that has never seen a bait trusts it'),
		effect('keeps', keepsDays === null ? 1 : keepsDays / Scale.KeepsForeverDays, keepsWords)
	];
}
