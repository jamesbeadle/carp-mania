import { BaitBrandCatalogue, BrandCatalogue, type BaitBrandName, type BrandName } from '$lib/domain/tackle/brands';
import { BaitCatalogue } from '$lib/domain/tackle/baits';
import { BarbLabels } from '$lib/domain/tackle/hooks';
import { LineColourLabels } from '$lib/domain/tackle/lines';
import { doesKindRunOut, UnitWords } from '$lib/domain/tackle/kinds';
import { ReelCatalogue } from '$lib/domain/tackle/reels';
import { RigCatalogue } from '$lib/domain/tackle/rigs';
import { landsUpToLb } from '$lib/domain/tackle/rods';
import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
import type { TackleItem } from '$lib/domain/tackle/tackleItem';
import { TubingLabels } from '$lib/domain/tackle/tubing';

const Brands = { ...BrandCatalogue, ...BaitBrandCatalogue };

export function brandLabelOf(item: Pick<TackleItem, 'brand'>) {
	return Brands[item.brand as BrandName | BaitBrandName].label;
}

export function tileNameOf(item: TackleItem): string {
	if (item.kind === 'rod') return `${item.rod.lengthFeet} ft ${item.rod.testCurveLb} lb`;
	if (item.kind === 'reel') return ReelCatalogue[item.reel].label;
	if (item.kind === 'line') return `${item.line.breakingStrainLb} lb ${LineColourLabels[item.line.colour].toLowerCase()}`;
	if (item.kind === 'hook') return `Size ${item.hook.size}`;
	if (item.kind === 'rig') return RigCatalogue[item.rig].label;
	if (item.kind === 'tubing') return `${TubingLabels[item.tubing].split(' (')[0]} tubing`;
	if (item.kind === 'bait') return BaitCatalogue[item.bait.kind].label;
	return 'Leads';
}

export function tileStatOf(item: TackleItem): string {
	if (item.kind === 'rod') return `lands ${landsUpToLb(item.rod)} lb${item.rod.isFullDuplon ? ' · duplon' : ''}`;
	if (item.kind === 'reel') return `casts ×${ReelCatalogue[item.reel].castFactor} · ${ReelCatalogue[item.reel].spool}`;
	if (item.kind === 'line') return `${item.line.diameterMm} mm · ${item.line.spoolMetres} m spool`;
	if (item.kind === 'hook') return `${BarbLabels[item.hook.barb].toLowerCase()} · ${item.hook.finish}`;
	if (item.kind === 'rig') return RigCatalogue[item.rig].behaviour.toLowerCase();
	if (item.kind === 'tubing') return TubingLabels[item.tubing].split(' (')[1].replace(')', '');
	if (item.kind === 'bait') return `appeal ×${(BaitCatalogue[item.bait.kind].appeal * item.bait.appealFactor).toFixed(2)}`;
	return 'for every rig';
}

export function tileStockOf(owned: OwnedItem) {
	if (!doesKindRunOut(owned.item.kind)) return `× ${owned.quantity}`;
	return `${Math.round(owned.quantity)} ${UnitWords[owned.item.kind]} left`;
}
