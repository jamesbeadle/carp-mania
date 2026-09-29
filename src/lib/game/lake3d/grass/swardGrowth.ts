import { ramp } from './coverDensity';
import type { CoverSite } from './coverSite';

const Lip = { From: 0.25, To: 0.8 } as const;
const Inland = { FadeFrom: 30, FadeTo: 60 } as const;
const Clearing = { From: 0, To: 1.2 } as const;
const Patchiness = { Least: 0.55, Swing: 0.45 } as const;
const Growth = { Least: 0.75, Swing: 0.5, MeadowLift: 0.35 } as const;
const Dryness = { PatchShare: 0.5, Lift: 0.35 } as const;

export function swardDensity(site: CoverSite) {
	const land = ramp(site.shore, Lip.From, Lip.To) * (1 - ramp(site.shore, Inland.FadeFrom, Inland.FadeTo));
	const clear = ramp(site.fromSwim, Clearing.From, Clearing.To);
	return land * clear * (Patchiness.Least + site.patch * Patchiness.Swing);
}

export function swardGrowth(site: CoverSite) {
	return Growth.Least + site.patch * Growth.Swing + site.meadow * site.meadow * Growth.MeadowLift;
}

export function swardDryness(site: CoverSite) {
	return Math.max(0, site.meadow - site.patch * Dryness.PatchShare) * Dryness.Lift;
}
