import { CoverCells, type CoverCell } from './coverAtlas';
import type { CoverSite } from './coverSite';

export interface Planting {
	cells: CoverCell[];
	heights: [number, number];
	widthPerHeight: [number, number];
	lean: number;
	reach: number;
	isMarginal: boolean;
	densityAt: (site: CoverSite, flowerShare: number) => number;
}

const Bank = { Lip: 0.3, FringeWidth: 2.6, FarFadeFrom: 40, FarFadeTo: 80 } as const;
const Swim = { Cleared: 2.5, Trodden: 5, BusyWithin: 28, QuietBeyond: 55, Busier: 4 } as const;
const Margin = { DeepestShore: -2.2, HighestShore: 1.4, Threshold: 0.36, Density: 6, PodView: 7, Cleared: 3 } as const;
const Meadow = { Threshold: 0.52, Density: 1.6, Fringe: 1.2, SwimGap: 7 } as const;
const Short = { Density: 1.15, Patchiness: 0.9 } as const;
const Flowers = { Buttercups: 0.7, Daisies: 0.6, SwimGap: 3.5 } as const;

function ramp(value: number, from: number, to: number) {
	return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

function landShare(site: CoverSite) {
	return ramp(site.shore, Bank.Lip * 0.5, Bank.Lip) * (1 - ramp(site.shore, Bank.FarFadeFrom, Bank.FarFadeTo));
}

function trodden(site: CoverSite) {
	return ramp(site.fromSwim, Swim.Cleared, Swim.Trodden);
}

function busynessAt(fromPod: number) {
	return 1 + (Swim.Busier - 1) * (1 - ramp(fromPod, Swim.BusyWithin, Swim.QuietBeyond));
}

function busyness(site: CoverSite) {
	return busynessAt(site.fromPod);
}

function meadowness(site: CoverSite) {
	const patch = ramp(site.meadow, Meadow.Threshold, 1);
	const fringe = (1 - ramp(site.shore, Bank.Lip, Bank.FringeWidth)) * ramp(site.margin, Margin.Threshold * 0.6, 1) * Meadow.Fringe;
	return Math.max(patch, fringe) * ramp(site.fromSwim, Meadow.SwimGap, Meadow.SwimGap * 2);
}

const shortGrass: Planting = {
	cells: [CoverCells.ShortGrass, CoverCells.ShortGrass, CoverCells.TuftedGrass],
	heights: [0.12, 0.3],
	widthPerHeight: [1.8, 2.8],
	lean: 0.22,
	reach: 1,
	isMarginal: false,
	densityAt: (site) => Short.Density * (1 - Short.Patchiness / 2 + site.patch * Short.Patchiness) * landShare(site) * trodden(site) * busyness(site) * (1 - meadowness(site) / 2)
};

const meadowGrass: Planting = { ...shortGrass, cells: [CoverCells.Meadow], heights: [0.45, 0.85], widthPerHeight: [0.9, 1.25], lean: 0.18, reach: 1.25, densityAt: (site) => Meadow.Density * meadowness(site) * landShare(site) };

const buttercups: Planting = { ...shortGrass, cells: [CoverCells.Buttercups], heights: [0.24, 0.42], widthPerHeight: [1, 1.3], reach: 1.1, densityAt: (site, flowerShare) => Flowers.Buttercups * flowerShare * site.bloom * site.bloom * meadowness(site) * landShare(site) };

const daisies: Planting = {
	...buttercups,
	cells: [CoverCells.Daisies],
	heights: [0.14, 0.26],
	widthPerHeight: [1.3, 1.7],
	densityAt: (site, flowerShare) => Flowers.Daisies * flowerShare * Math.pow(site.bloom, 3) * landShare(site) * ramp(site.fromSwim, Flowers.SwimGap, Flowers.SwimGap * 2)
};

const marginals: Planting = {
	cells: [CoverCells.Rushes, CoverCells.Rushes, CoverCells.Sedge, CoverCells.Sedge, CoverCells.Spikes],
	heights: [0.7, 1.45],
	widthPerHeight: [0.75, 1.15],
	lean: 0.1,
	reach: 1.6,
	isMarginal: true,
	densityAt: (site) => {
		const isInTheMargin = site.shore > Margin.DeepestShore && site.shore < Margin.HighestShore;
		const clump = Math.pow(ramp(site.margin, Margin.Threshold, 1), 0.7);
		return isInTheMargin ? Margin.Density * clump * ramp(site.fromPod, Margin.PodView, Margin.PodView * 1.5) * ramp(site.fromSwim, Margin.Cleared, Margin.Cleared * 2) : 0;
	}
};

export const Plantings = [shortGrass, meadowGrass, buttercups, daisies, marginals];
export function mostPlantsPerSquareMetre(fromPod: number) {
	return Short.Density * (1 + Short.Patchiness / 2) * busynessAt(fromPod) + Margin.Density + Meadow.Density;
}
