import type { ShoreBand } from './shoreBand';
import { LongestShelfMetres, MostRiseMetres } from './shoreCharacter';

export interface RowSpacing {
	finestMetres: number;
	growth: number;
	shelfStepMetres: number;
	riseStepMetres: number;
	flatStepMetres: number;
}

const Fine: RowSpacing = { finestMetres: 0.08, growth: 1.3, shelfStepMetres: 1.3, riseStepMetres: 0.45, flatStepMetres: 6 };
const Coarse: RowSpacing = { finestMetres: 0.14, growth: 1.35, shelfStepMetres: 1.8, riseStepMetres: 0.7, flatStepMetres: 6 };

function stepsOut(reach: number, curvedUntil: number, curvedStep: number, spacing: RowSpacing) {
	const offsets: number[] = [];
	let step = spacing.finestMetres;
	for (let offset = step; offset < reach; offset += step) {
		offsets.push(offset);
		const largestStep = offset < curvedUntil ? curvedStep : spacing.flatStepMetres;
		step = Math.min(step * spacing.growth, largestStep);
	}
	return [...offsets, reach];
}

export function rowOffsets(band: ShoreBand, isFine: boolean) {
	const spacing = isFine ? Fine : Coarse;
	const landward = stepsOut(band.landReach, MostRiseMetres, spacing.riseStepMetres, spacing);
	const waterward = stepsOut(band.waterReach, LongestShelfMetres, spacing.shelfStepMetres, spacing).map((offset) => -offset);
	return [...waterward.reverse(), 0, ...landward];
}
