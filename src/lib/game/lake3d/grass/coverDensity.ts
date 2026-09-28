import type { CoverSite } from './coverSite';

const Bank = { Lip: 0.3, FringeWidth: 2.6, FarFadeFrom: 34, FarFadeTo: 72 } as const;
const Swim = { Worn: -0.7, Trodden: 2.6, TroddenCurve: 1.7, BusyWithin: 18, QuietBeyond: 45, Busier: 2.2 } as const;
const Margin = { DeepestShore: -2.2, HighestShore: 1.4, Threshold: 0.36, Density: 6, PodView: 7, PodViewFade: 3.5, Cleared: 0.3, ClearedFade: 1, Clumping: 0.7, BesidePod: 0.3 } as const;
const Meadow = { Threshold: 0.52, Density: 1.6, Fringe: 1.2, SwimGap: 3.5, FringeThreshold: 0.22 } as const;
const Short = { Density: 4, Patchiness: 0.9 } as const;
const Flowers = { Buttercups: 0.7, Daisies: 0.6, SwimGap: 1, DaisyRarity: 3 } as const;

function ramp(value: number, from: number, to: number) {
	return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

function landShare(site: CoverSite) {
	return ramp(site.shore, Bank.Lip / 2, Bank.Lip) * (1 - ramp(site.shore, Bank.FarFadeFrom, Bank.FarFadeTo));
}

function busynessAt(fromPod: number) {
	return 1 + (Swim.Busier - 1) * (1 - ramp(fromPod, Swim.BusyWithin, Swim.QuietBeyond));
}

function meadowness(site: CoverSite) {
	const patch = ramp(site.meadow, Meadow.Threshold, 1);
	const fringe = (1 - ramp(site.shore, Bank.Lip, Bank.FringeWidth)) * ramp(site.margin, Meadow.FringeThreshold, 1) * Meadow.Fringe;
	return Math.max(patch, fringe) * ramp(site.fromSwim, Meadow.SwimGap, Meadow.SwimGap * 2);
}

export function shortGrassDensity(site: CoverSite) {
	const patchiness = 1 - Short.Patchiness / 2 + site.patch * Short.Patchiness;
	const trodden = Math.pow(ramp(site.fromSwim, Swim.Worn, Swim.Trodden), Swim.TroddenCurve);
	return Short.Density * patchiness * landShare(site) * trodden * busynessAt(site.fromPod) * (1 - meadowness(site) / 2);
}

export function meadowDensity(site: CoverSite) {
	return Meadow.Density * meadowness(site) * landShare(site);
}

export function buttercupDensity(site: CoverSite, flowerShare: number) {
	return Flowers.Buttercups * flowerShare * site.bloom * site.bloom * meadowness(site) * landShare(site);
}

export function daisyDensity(site: CoverSite, flowerShare: number) {
	const awayFromSwims = ramp(site.fromSwim, Flowers.SwimGap, Flowers.SwimGap * 2);
	return Flowers.Daisies * flowerShare * Math.pow(site.bloom, Flowers.DaisyRarity) * landShare(site) * awayFromSwims;
}

export function marginDensity(site: CoverSite) {
	const isInTheMargin = site.shore > Margin.DeepestShore && site.shore < Margin.HighestShore;
	if (!isInTheMargin) return 0;
	const clump = Math.pow(ramp(site.margin, Margin.Threshold, 1), Margin.Clumping);
	const awayFromThePod = ramp(site.fromPod, Margin.PodView, Margin.PodView + Margin.PodViewFade);
	const besideThePod = Margin.BesidePod * (1 - site.podView);
	const clearOfTheSwim = ramp(site.fromSwim, Margin.Cleared, Margin.Cleared + Margin.ClearedFade);
	return Margin.Density * clump * Math.max(awayFromThePod, besideThePod) * clearOfTheSwim;
}

export const SwimsReachMetres = Swim.QuietBeyond + Meadow.SwimGap * 2;

export function mostPlantsPerSquareMetre(fromPod: number, shore: number, slack: number) {
	const isNearLand = shore + slack > Bank.Lip / 2;
	const isNearMargin = shore - slack < Margin.HighestShore && shore + slack > Margin.DeepestShore;
	const land = isNearLand ? Short.Density * (1 + Short.Patchiness / 2) * busynessAt(fromPod) + Meadow.Density * Meadow.Fringe : 0;
	return land + (isNearMargin ? Margin.Density : 0);
}
