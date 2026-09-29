import type { SeasonName } from '$lib/domain/world/worldClock';
import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import { CoverNoise } from './coverNoise';
import type { ShoreField } from './shoreField';
import { metresFromAnyPod, metresFromAnySwim, viewAheadOfPods, type SwimClearing } from './swimClearings';

export interface CoverGround {
	shore: ShoreField;
	swims: SwimClearing[];
	facilities: ClearSpot[];
	plotEdge: WorldPoint | null;
	groundAt: (point: WorldPoint) => number;
	season: SeasonName;
	seed: number;
}

export interface CoverSite {
	point: WorldPoint;
	shore: number;
	fromSwim: number;
	fromPod: number;
	podView: number;
	meadow: number;
	patch: number;
	margin: number;
	bloom: number;
}

const Wavelengths = { Meadow: 24, Patch: 7, Margin: 11, Bloom: 5 } as const;
const FarFromSwims = 1e6;
const Clear = { FacilityMargin: 1.5, PlotEdgeMargin: 1, Feather: 3 } as const;

export class CoverSites {
	private readonly noise: CoverNoise;

	constructor(private readonly ground: CoverGround) {
		this.noise = new CoverNoise(ground.seed);
	}

	siteAt(point: WorldPoint, isFarFromSwims = false): CoverSite {
		const { noise } = this;
		const { swims } = this.ground;
		return {
			point,
			shore: this.ground.shore.distanceAt(point),
			fromSwim: isFarFromSwims ? FarFromSwims : metresFromAnySwim(point, swims),
			fromPod: isFarFromSwims ? FarFromSwims : metresFromAnyPod(point, swims),
			podView: isFarFromSwims ? 0 : viewAheadOfPods(point, swims),
			meadow: noise.at(point, Wavelengths.Meadow),
			patch: noise.at(point, Wavelengths.Patch),
			margin: noise.at({ x: point.z, z: point.x }, Wavelengths.Margin),
			bloom: noise.at({ x: -point.x, z: point.z }, Wavelengths.Bloom)
		};
	}

	noiseAt(point: WorldPoint, wavelength: number) {
		return this.noise.at(point, wavelength);
	}

	facilitiesNear(point: WorldPoint, slack: number) {
		return this.ground.facilities.filter((spot) => metresBetween(spot.point, point) < spot.radius + Clear.FacilityMargin + Clear.Feather + slack);
	}

	clearanceFrom(point: WorldPoint, facilities: ClearSpot[]) {
		const edge = this.ground.plotEdge;
		const isOffThePlot = edge !== null && (Math.abs(point.x) > edge.x - Clear.PlotEdgeMargin || Math.abs(point.z) > edge.z - Clear.PlotEdgeMargin);
		if (isOffThePlot) return 0;
		const beyond = (spot: ClearSpot) => (metresBetween(spot.point, point) - spot.radius - Clear.FacilityMargin) / Clear.Feather;
		return facilities.reduce((least, spot) => Math.min(least, Math.max(0, beyond(spot))), 1);
	}
}
