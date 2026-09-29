import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { CoverNoise } from '../grass/coverNoise';
import type { SurveyedBank } from '../grass/coverGround';

const Waterside = { StepMetres: 1.5, Reach: 2.6, NearestWater: 0.5, FarthestWater: 2.4, NoiseSeed: 404, Share: 0.7 } as const;
const Runs = { Wavelength: 15, Threshold: 0.5 } as const;
const Gaps = { Wavelength: 3.5, Threshold: 0.48 } as const;
const Centred = 1 / 2;

function candidatesAlong(edge: WorldPoint[], random: RandomFraction) {
	return edge.flatMap((point, index) => {
		const next = edge[(index + 1) % edge.length];
		const steps = Math.ceil(Math.hypot(next.x - point.x, next.z - point.z) / Waterside.StepMetres);
		return Array.from({ length: steps }, (_, step) => ({
			x: point.x + ((next.x - point.x) * step) / steps + (random() - Centred) * Waterside.Reach * 2,
			z: point.z + ((next.z - point.z) * step) / steps + (random() - Centred) * Waterside.Reach * 2
		}));
	});
}

export function watersideSpots(bank: SurveyedBank, density: number, random: RandomFraction) {
	const noise = new CoverNoise(Waterside.NoiseSeed);
	const candidates = bank.edges.flatMap((edge) => candidatesAlong(edge, random));
	return candidates.filter((point) => {
		const fromWater = bank.shore.distanceAt(point);
		const isOnTheLip = fromWater > Waterside.NearestWater && fromWater < Waterside.FarthestWater;
		const isInARun = noise.at(point, Runs.Wavelength) > Runs.Threshold && noise.at(point, Gaps.Wavelength) > Gaps.Threshold;
		return isOnTheLip && isInARun && random() < density * Waterside.Share;
	});
}
