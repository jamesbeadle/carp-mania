import { BaseCastFeet } from '../castDistance';
import { ReelCatalogue } from '../reels';
import { landsUpToLb, RodLandsUpToLb, RodLengthCastFactor } from '../rods';
import type { ReelItem, RodItem } from '../tackleItem';
import { effect, type ItemEffect } from './itemEffect';

const LongestRodFactor = Math.max(...Object.values(RodLengthCastFactor));
const HeaviestLandsLb = Math.max(...Object.values(RodLandsUpToLb));
const Scale = { LongestRodFactor, HeaviestLandsLb, FurthestReelFactor: 1.3, StandardHandleShare: 0.55 } as const;
const HandleWords = { FullDuplon: 'full duplon — a wider tension band in the fight', Standard: 'a standard handle' } as const;

export function rodEffects(item: RodItem): ItemEffect[] {
	const { rod } = item;
	const castFactor = RodLengthCastFactor[rod.lengthFeet];
	const lands = landsUpToLb(rod);
	const handleShare = rod.isFullDuplon ? 1 : Scale.StandardHandleShare;
	const handleWords = rod.isFullDuplon ? HandleWords.FullDuplon : HandleWords.Standard;
	return [
		effect('reach', castFactor / Scale.LongestRodFactor, `${Math.round(BaseCastFeet * castFactor)} ft with a standard reel`),
		effect('landing', lands / Scale.HeaviestLandsLb, `lands up to ${lands} lb`),
		effect('forgiveness', handleShare, handleWords)
	];
}

export function reelEffects(item: ReelItem): ItemEffect[] {
	const { castFactor, retrieveFactor, note } = ReelCatalogue[item.reel];
	const reachFeet = Math.round(BaseCastFeet * castFactor);
	return [
		effect('reach', castFactor / Scale.FurthestReelFactor, `casts ×${castFactor} — ${reachFeet} ft on a 12 ft rod`),
		effect('retrieve', retrieveFactor, `winds ×${retrieveFactor} — ${note.toLowerCase()}`)
	];
}
