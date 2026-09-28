export const Thinning = { FullWithin: 16, GoneBeyond: 170, Curve: 1.5, Fade: 0.15, Growth: 0.006 } as const;

export function keptShareAt(metres: number) {
	const share = Math.min(1, Math.max(0, (Thinning.GoneBeyond - metres) / (Thinning.GoneBeyond - Thinning.FullWithin)));
	return Math.min(1, Math.pow(share, Thinning.Curve) * (1 + Thinning.Fade));
}
