import { HookSizeNote, type HookStats } from '$lib/domain/tackle/hooks';
import type { LineStats } from '$lib/domain/tackle/lines';
import { ReelCatalogue, type ReelProfile } from '$lib/domain/tackle/reels';
import { RigCatalogue, type RigProfile } from '$lib/domain/tackle/rigs';
import { landsUpToLb, RodLengthWords, RodWords, type RodStats } from '$lib/domain/tackle/rods';
import type { TackleItem } from '$lib/domain/tackle/tackleItem';
import { TubingLabels } from '$lib/domain/tackle/tubing';

export function statsWordsFor(item: TackleItem): string {
	if (item.kind === 'rod') return rodWords(item.rod);
	if (item.kind === 'reel') return reelWords(ReelCatalogue[item.reel]);
	if (item.kind === 'line') return lineWords(item.line);
	if (item.kind === 'hook') return hookWords(item.hook);
	if (item.kind === 'rig') return rigWords(RigCatalogue[item.rig]);
	if (item.kind === 'tubing') return TubingLabels[item.tubing];
	if (item.kind === 'bait') return `Appeal ×${item.bait.appealFactor}`;
	return 'Leads for every rig';
}

function rodWords(rod: RodStats) {
	const duplon = rod.isFullDuplon ? ' · full duplon' : '';
	return `Lands up to ${landsUpToLb(rod)} lb · ${RodWords[rod.testCurveLb]} · ${RodLengthWords[rod.lengthFeet]}${duplon}`;
}

function reelWords(reel: ReelProfile) {
	return `Cast ×${reel.castFactor} · retrieve ×${reel.retrieveFactor} · ${reel.note}`;
}

function lineWords(line: LineStats) {
	return `${line.breakingStrainLb} lb at ${line.diameterMm} mm — ${visibilityWords(line.diameterMm)}`;
}

function hookWords(hook: HookStats) {
	return `${HookSizeNote[hook.size]} · ${wireWords(hook.straightensAboveLb, hook.snapsAboveLb)}`;
}

function rigWords(rig: RigProfile) {
	return `Casts ×${rig.castFactor} · suits ${rig.suitsBed.join(' and ')}`;
}

const Visibility = { InvisibleBelowMm: 0.31, FineBelowMm: 0.37 } as const;

function visibilityWords(diameterMm: number) {
	if (diameterMm < Visibility.InvisibleBelowMm) return 'as near invisible as line gets';
	if (diameterMm < Visibility.FineBelowMm) return 'fine';
	return 'a fish can see it in clear water';
}

function wireWords(straightensAboveLb: number, snapsAboveLb: number) {
	if (!Number.isFinite(straightensAboveLb)) return `never straightens, snaps above ${snapsAboveLb} lb`;
	return `opens above ${straightensAboveLb} lb`;
}
