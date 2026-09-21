import { BaseCastFeet } from '../castDistance';
import { ReelCatalogue } from '../reels';
import { landsUpToLb, RodLandsUpToLb, RodLengthCastFactor } from '../rods';
import type { ReelItem, RodItem } from '../tackleItem';
import { effect, type ItemEffect } from './itemEffect';

const Scale = { LongestRodFactor: Math.max(...Object.values(RodLengthCastFactor)), HeaviestLandsLb: Math.max(...Object.values(RodLandsUpToLb)), FurthestReelFactor: 1.3, StandardHandleShare: 0.55 } as const;
const HandleWords = { FullDuplon: 'full duplon — a wider tension band in the fight', Standard: 'a standard handle' } as const;

export function rodEffects(item: RodItem): ItemEffect[] {
	const { rod } = item;
	const castFactor = RodLengthCastFactor[rod.lengthFeet];
	const lands = landsUpToLb(rod);
	return [
		effect('reach', castFactor / Scale.LongestRodFactor, `${Math.round(BaseCastFeet * castFactor)} ft with a standard reel`),
		effect('landing', lands / Scale.HeaviestLandsLb, `lands up to ${lands} lb`),
		effect('forgiveness', rod.isFullDuplon ? 1 : Scale.StandardHandleShare, rod.isFullDuplon ? HandleWords.FullDuplon : HandleWords.Standard)
	];
}

export function reelEffects(item: ReelItem): ItemEffect[] {
	const reel = ReelCatalogue[item.reel];
	return [
		effect('reach', reel.castFactor / Scale.FurthestReelFactor, `casts ×${reel.castFactor} — ${Math.round(BaseCastFeet * reel.castFactor)} ft on a 12 ft rod`),
		effect('retrieve', reel.retrieveFactor, `winds ×${reel.retrieveFactor} — ${reel.note.toLowerCase()}`)
	];
}
