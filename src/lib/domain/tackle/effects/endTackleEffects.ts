import { BarbHold, HookHoldChance, HookSizeNote } from '../hooks';
import { BreakingStrains, LineColourLabels, lineVisibility } from '../lines';
import { PresentationLabels } from '../presentations';
import { RigCatalogue } from '../rigs';
import type { HookItem, LineItem, RigItem } from '../tackleItem';
import { effect, type ItemEffect } from './itemEffect';

const Scale = { StrongestLineLb: Math.max(...BreakingStrains), HookNeverOpensLb: 60, FurthestRigFactor: 1.1, ShinyStealth: 0.45 } as const;
const FinishWords = { matt: 'matt — hard for a fish to see', shiny: 'shiny — draws young fish, spooks old ones in clear water' } as const;

export function lineEffects(item: LineItem): ItemEffect[] {
	const { line } = item;
	const visibility = lineVisibility(line);
	const colour = LineColourLabels[line.colour].toLowerCase();
	return [
		effect('strength', line.breakingStrainLb / Scale.StrongestLineLb, `${line.breakingStrainLb} lb breaking strain`),
		effect('stealth', 1 - visibility, `${line.diameterMm} mm, ${colour} — ${stealthWords(visibility)}`)
	];
}

export function hookEffects(item: HookItem): ItemEffect[] {
	const { hook } = item;
	const hold = HookHoldChance[hook.size] * BarbHold[hook.barb];
	const isForever = !Number.isFinite(hook.straightensAboveLb);
	const strengthWords = isForever ? `never straightens, snaps above ${hook.snapsAboveLb} lb` : `can open on a fish over ${hook.straightensAboveLb} lb`;
	return [
		effect('hold', hold, `${Math.round(hold * 100)}% of strikes stay on — ${HookSizeNote[hook.size].toLowerCase()}`),
		effect('strength', isForever ? 1 : hook.straightensAboveLb / Scale.HookNeverOpensLb, strengthWords),
		effect('stealth', hook.finish === 'matt' ? 1 : Scale.ShinyStealth, FinishWords[hook.finish])
	];
}

export function rigEffects(item: RigItem): ItemEffect[] {
	const rig = RigCatalogue[item.rig];
	const presents = rig.presents.map((presentation) => PresentationLabels[presentation].toLowerCase()).join(' or ');
	return [
		effect('presentation', rig.presentationScore, `presents a ${presents} — ${rig.behaviour.toLowerCase()}`),
		effect('reach', rig.castFactor / Scale.FurthestRigFactor, `casts ×${rig.castFactor}`),
		effect('staying_put', rig.holdsPosition, rig.holdsPosition >= 1 ? 'sits where it lands' : 'moves after it lands')
	];
}

function stealthWords(visibility: number) {
	if (visibility <= 0) return 'as near invisible as line gets';
	if (visibility < 0.35) return 'fine';
	return 'a fish can see it in clear water';
}
