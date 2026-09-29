import { coverQuality } from '../renderQuality';

export const Thinning = { FullWithin: 14, GoneBeyond: 110, Curve: 1.6, Fade: 0.15, Growth: 0.006 } as const;

export function thinningReach() {
	const cover = coverQuality();
	return { fullWithin: Thinning.FullWithin * cover.reach, goneBeyond: Thinning.GoneBeyond * cover.reach };
}

export function hiddenBeyondMetres(mostReach: number) {
	const { goneBeyond } = thinningReach();
	return goneBeyond * mostReach;
}

export function keptShareAt(metres: number) {
	const { fullWithin, goneBeyond } = thinningReach();
	const share = Math.min(1, Math.max(0, (goneBeyond - metres) / (goneBeyond - fullWithin)));
	return Math.min(1, Math.pow(share, Thinning.Curve) * (1 + Thinning.Fade));
}
