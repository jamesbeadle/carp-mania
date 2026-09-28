import type { ShoreBand } from './shoreBand';
import { Shore } from './shoreProfile';

export interface RowSpacing {
	finestMetres: number;
	growth: number;
	shelfStepMetres: number;
	flatStepMetres: number;
}

const Fine: RowSpacing = { finestMetres: 0.07, growth: 1.17, shelfStepMetres: 1.1, flatStepMetres: 4 };
const Coarse: RowSpacing = { finestMetres: 0.14, growth: 1.35, shelfStepMetres: 1.8, flatStepMetres: 6 };

function stepsOut(reach: number, curvedUntil: number, spacing: RowSpacing) {
	const offsets: number[] = [];
	let step = spacing.finestMetres;
	for (let offset = step; offset < reach; offset += step) {
		offsets.push(offset);
		const largestStep = offset < curvedUntil ? spacing.shelfStepMetres : spacing.flatStepMetres;
		step = Math.min(step * spacing.growth, largestStep);
	}
	return [...offsets, reach];
}

export function rowOffsets(band: ShoreBand, isFine: boolean) {
	const spacing = isFine ? Fine : Coarse;
	const landward = stepsOut(band.landReach, Shore.IslandDropMetres, spacing);
	const waterward = stepsOut(band.waterReach, Shore.ShelfMetres, spacing).map((offset) => -offset);
	return [...waterward.reverse(), 0, ...landward];
}
