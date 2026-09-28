import type { Fish } from './fish';
import { densityPerAcre, type CatchDay, type Lake } from './lake';
import { Density, RatingTerms, RatingWeights } from './rules';

export function ratingOf(lake: Lake) {
	const facilities = Math.min(1, lake.facilitiesSpent / RatingTerms.FacilitiesForFullMarks);
	const water = lake.quality / RatingTerms.Highest;
	const rating =
		RatingWeights.Facilities * facilities +
		RatingWeights.Head * headShareOf(densityPerAcre(lake)) +
		RatingWeights.Quality * qualityShareOf(lake.fish) +
		RatingWeights.CatchRate * catchShareOf(lake.catchDays) +
		RatingWeights.Water * water;
	return Math.round(rating * 10) / 10;
}

function headShareOf(density: number) {
	if (density < Density.IdealFromPerAcre) return density / Density.IdealFromPerAcre;
	if (density <= Density.IdealToPerAcre) return 1;
	return Math.max(0, 1 - (density - Density.IdealToPerAcre) / (Density.CrowdedPerAcre - Density.IdealToPerAcre));
}

function qualityShareOf(fish: Fish[]) {
	const top = [...fish].sort((one, other) => other.weightLb - one.weightLb).slice(0, RatingTerms.TopFishCounted);
	if (top.length === 0) return 0;
	const sizeShare = top.reduce((total, one) => total + Math.min(1, one.weightLb / RatingTerms.QualityBenchmarkLb), 0) / top.length;
	const conditionShare = top.reduce((total, one) => total + one.condition / RatingTerms.Highest, 0) / top.length;
	return sizeShare * conditionShare;
}

function catchShareOf(days: CatchDay[]) {
	const anglers = days.reduce((total, day) => total + day.anglers, 0);
	const landed = days.reduce((total, day) => total + day.landed, 0);
	if (anglers === 0) return 0;
	return Math.min(1, landed / anglers / RatingTerms.LandedPerAnglerDayForFullMarks);
}
