import { BaitBrandCatalogue, BrandCatalogue, type BaitBrandName, type BrandName } from '$lib/domain/tackle/brands';
import { BaitCatalogue } from '$lib/domain/tackle/baits';
import { BarbLabels, type HookStats } from '$lib/domain/tackle/hooks';
import { doesKindRunOut, UnitWords } from '$lib/domain/tackle/kinds';
import { LineColourLabels, type LineStats } from '$lib/domain/tackle/lines';
import { ReelCatalogue } from '$lib/domain/tackle/reels';
import { RigCatalogue } from '$lib/domain/tackle/rigs';
import { landsUpToLb, type RodStats } from '$lib/domain/tackle/rods';
import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
import type { BaitStats, TackleItem } from '$lib/domain/tackle/tackleItem';
import { TubingLabels } from '$lib/domain/tackle/tubing';

const Brands = { ...BrandCatalogue, ...BaitBrandCatalogue };

export function brandLabelOf(item: Pick<TackleItem, 'brand'>) {
	return Brands[item.brand as BrandName | BaitBrandName].label;
}

export function tileNameOf(item: TackleItem): string {
	if (item.kind === 'rod') return rodName(item.rod);
	if (item.kind === 'reel') return ReelCatalogue[item.reel].label;
	if (item.kind === 'line') return lineName(item.line);
	if (item.kind === 'hook') return `Size ${item.hook.size}`;
	if (item.kind === 'rig') return RigCatalogue[item.rig].label;
	if (item.kind === 'tubing') return `${tubingColourOf(item.tubing)} tubing`;
	if (item.kind === 'bait') return BaitCatalogue[item.bait.kind].label;
	return 'Leads';
}

export function tileStatOf(item: TackleItem): string {
	if (item.kind === 'rod') return rodStat(item.rod);
	if (item.kind === 'reel') return reelStat(item.reel);
	if (item.kind === 'line') return lineStat(item.line);
	if (item.kind === 'hook') return hookStat(item.hook);
	if (item.kind === 'rig') return RigCatalogue[item.rig].behaviour.toLowerCase();
	if (item.kind === 'tubing') return tubingReadsAs(item.tubing);
	if (item.kind === 'bait') return baitStat(item.bait);
	return 'for every rig';
}

export function tileStockOf(owned: OwnedItem) {
	const { kind } = owned.item;
	if (!doesKindRunOut(kind)) return `× ${owned.quantity}`;
	return `${Math.round(owned.quantity)} ${UnitWords[kind]} left`;
}

const rodName = (rod: RodStats) => `${rod.lengthFeet} ft ${rod.testCurveLb} lb`;
const rodStat = (rod: RodStats) => `lands ${landsUpToLb(rod)} lb${rod.isFullDuplon ? ' · duplon' : ''}`;
const lineName = (line: LineStats) => `${line.breakingStrainLb} lb ${LineColourLabels[line.colour].toLowerCase()}`;
const lineStat = (line: LineStats) => `${line.diameterMm} mm · ${line.spoolMetres} m spool`;
const hookStat = (hook: HookStats) => `${BarbLabels[hook.barb].toLowerCase()} · ${hook.finish}`;
const tubingColourOf = (colour: keyof typeof TubingLabels) => TubingLabels[colour].split(' (')[0];
const tubingReadsAs = (colour: keyof typeof TubingLabels) => TubingLabels[colour].split(' (')[1].replace(')', '');

function reelStat(kind: keyof typeof ReelCatalogue) {
	const reel = ReelCatalogue[kind];
	return `casts ×${reel.castFactor} · ${reel.spool}`;
}

function baitStat(bait: BaitStats) {
	const appeal = BaitCatalogue[bait.kind].appeal * bait.appealFactor;
	return `appeal ×${appeal.toFixed(2)}`;
}
