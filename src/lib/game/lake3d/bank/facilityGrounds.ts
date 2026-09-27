import { Facilities, type Facility, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import { isOpenWater, type WaterShape } from '../swimFacing';
import { centreOf, distanceToOutline, headingFrom, isInsideOutline, pointToward } from '../worldGeometry';
import { FacilityModels } from './facilityModels';

export interface FacilityPlot {
	facility: Facility;
	point: WorldPoint;
	facing: number;
	footprintMetres: number;
}

export interface ClearSpot {
	point: WorldPoint;
	radius: number;
}

const Placing = { Bearings: 36, SetbackFromWater: 10, ClearOfAPeg: 14, OutwardStep: 2, FarthestOut: 480, AeratorFromTheBank: 22 } as const;
const PegClearance = 12;

function isClear(point: WorldPoint, radius: number, taken: ClearSpot[]) {
	return taken.every((spot) => metresBetween(spot.point, point) > spot.radius + radius);
}

function plotOnTheBank(water: WaterShape, bearing: number, footprint: number, taken: ClearSpot[]): WorldPoint | null {
	const centre = centreOf(water.outline);
	for (let metres = 0; metres < Placing.FarthestOut; metres += Placing.OutwardStep) {
		const point = pointToward(centre, bearing, metres);
		if (isInsideOutline(point, water.outline)) continue;
		const isFarEnough = distanceToOutline(point, water.outline) >= Placing.SetbackFromWater + footprint / 2;
		if (isFarEnough && isClear(point, footprint / 2, taken)) return point;
	}
	return null;
}

function plotInTheWater(water: WaterShape) {
	const centre = centreOf(water.outline);
	return isOpenWater(centre, water) ? centre : pointToward(water.outline[0], headingFrom(water.outline[0], centre), Placing.AeratorFromTheBank);
}

export function plotFacilities(layout: LakeLayout, water: WaterShape, pegs: WorldPoint[]): FacilityPlot[] {
	const taken: ClearSpot[] = pegs.map((point) => ({ point, radius: PegClearance }));
	const built = Facilities.filter((facility) => layout.facilities.includes(facility));
	const centre = centreOf(water.outline);
	return built.flatMap((facility, index) => {
		const model = FacilityModels[facility];
		const point = model.isInTheWater ? plotInTheWater(water) : firstClearBearing(water, index, model.footprintMetres, taken);
		if (!point) return [];
		taken.push({ point, radius: model.footprintMetres / 2 });
		return [{ facility, point, facing: headingFrom(point, centre), footprintMetres: model.footprintMetres }];
	});
}

function firstClearBearing(water: WaterShape, index: number, footprint: number, taken: ClearSpot[]) {
	for (let step = 0; step < Placing.Bearings; step++) {
		const bearing = ((index * 7 + step) / Placing.Bearings) * Math.PI * 2;
		const point = plotOnTheBank(water, bearing, footprint, taken);
		if (point) return point;
	}
	return null;
}
