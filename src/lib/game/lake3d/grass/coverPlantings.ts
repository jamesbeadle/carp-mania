import { CoverCells, type CoverCell } from './coverAtlas';
import { buttercupDensity, daisyDensity, marginDensity, meadowDensity, shortGrassDensity } from './coverDensity';
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

const shortGrass: Planting = {
	cells: [CoverCells.ShortGrass, CoverCells.ShortGrass, CoverCells.TuftedGrass],
	heights: [0.12, 0.3],
	widthPerHeight: [1.8, 2.8],
	lean: 0.22,
	reach: 1,
	isMarginal: false,
	densityAt: shortGrassDensity
};

const meadowGrass: Planting = {
	...shortGrass,
	cells: [CoverCells.Meadow],
	heights: [0.45, 0.85],
	widthPerHeight: [0.9, 1.25],
	lean: 0.18,
	reach: 1.25,
	densityAt: meadowDensity
};

const buttercups: Planting = {
	...shortGrass,
	cells: [CoverCells.Buttercups],
	heights: [0.24, 0.42],
	widthPerHeight: [1, 1.3],
	reach: 1.1,
	densityAt: buttercupDensity
};

const daisies: Planting = { ...buttercups, cells: [CoverCells.Daisies], heights: [0.14, 0.26], widthPerHeight: [1.3, 1.7], densityAt: daisyDensity };

const { Rushes, Sedge, Spikes } = CoverCells;

const marginals: Planting = {
	cells: [Rushes, Rushes, Rushes, Sedge, Sedge, Sedge, Spikes],
	heights: [0.7, 1.45],
	widthPerHeight: [0.75, 1.15],
	lean: 0.1,
	reach: 1.6,
	isMarginal: true,
	densityAt: marginDensity
};

export const Plantings = [shortGrass, meadowGrass, buttercups, daisies, marginals];
