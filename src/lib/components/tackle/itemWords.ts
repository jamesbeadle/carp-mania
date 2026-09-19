import { HookSizeNote, type HookStats } from '$lib/domain/tackle/hooks';
import type { LineStats } from '$lib/domain/tackle/lines';
import { BaitCatalogue } from '$lib/domain/tackle/baits';
import { PresentationLabels } from '$lib/domain/tackle/presentations';
import type { BaitStats } from '$lib/domain/tackle/tackleItem';
import { ReelCatalogue, type ReelProfile } from '$lib/domain/tackle/reels';
import { RigCatalogue, type RigProfile } from '$lib/domain/tackle/rigs';
import { landsUpToLb, RodLengthWords, RodWords, type RodStats } from '$lib/domain/tackle/rods';
import type { TackleItem } from '$lib/domain/tackle/tackleItem';
import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
import { TubingLabels } from '$lib/domain/tackle/tubing';

const MillisecondsPerFisheryDay = 60 * 60 * 1000;

export function keepingWordsFor(owned: OwnedItem): string {
	if (owned.isSpoiled) return ' · gone off';
	if (!owned.spoilsAt) return '';
	const daysLeft = Math.max(0, Math.ceil((new Date(owned.spoilsAt).getTime() - Date.now()) / MillisecondsPerFisheryDay));
	return ` · spoils in ${daysLeft} fishery ${daysLeft === 1 ? 'day' : 'days'}`;
}

export function statsWordsFor(item: TackleItem): string {
	if (item.kind === 'rod') return rodWords(item.rod);
	if (item.kind === 'reel') return reelWords(ReelCatalogue[item.reel]);
	if (item.kind === 'line') return lineWords(item.line);
	if (item.kind === 'hook') return hookWords(item.hook);
	if (item.kind === 'rig') return rigWords(RigCatalogue[item.rig]);
	if (item.kind === 'tubing') return TubingLabels[item.tubing];
	if (item.kind === 'bait') return baitWords(item.bait);
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

function baitWords(bait: BaitStats) {
	const profile = BaitCatalogue[bait.kind];
	const keeps = profile.keepsDays === null ? 'keeps' : `keeps ${profile.keepsDays} fishery days`;
	return `${PresentationLabels[profile.presentation]} · appeal ×${bait.appealFactor} · ${keeps} · ${profile.note}`;
}

function rigWords(rig: RigProfile) {
	const presents = rig.presents.map((presentation) => PresentationLabels[presentation].toLowerCase()).join(' or ');
	return `Casts ×${rig.castFactor} · presents a ${presents} · ${rig.behaviour}`;
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
