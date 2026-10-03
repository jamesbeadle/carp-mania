import { fractionAcrossForFeet, fractionDownForFeet } from '../../layout/layoutScale';
import type { FacilitySite } from '../../layout/facilitySite';
import type { Facility, LayoutPoint } from '../../layout/layoutTypes';
import { isInWater, lakeCentroid } from '../../layout/waterArea';
import { isPlacedInTheWater } from './buildingSizes';
import { StandardCarPark } from './carParkPlan';
import { siteFitFailures, type SiteSurroundings } from './siteFit';

const Search = { Bearings: 24, StepFeet: 12, FarthestFeet: 2400, FirstBearing: -Math.PI / 2, BearingsBetweenFacilities: 5 } as const;
const QuarterTurn = Math.PI / 2;

export function defaultSiteFor(facility: Facility, index: number, surroundings: SiteSurroundings): FacilitySite {
	const carPark = facility === 'car_park' ? { carPark: StandardCarPark } : {};
	if (isPlacedInTheWater(facility)) return { facility, centre: openWaterSpot(surroundings), rotation: 0, ...carPark };
	const fallback: FacilitySite = { facility, centre: lakeCentroid(surroundings.layout), rotation: 0, ...carPark };
	for (let step = 0; step < Search.Bearings; step++) {
		const bearing = Search.FirstBearing + (((index * Search.BearingsBetweenFacilities + step) % Search.Bearings) / Search.Bearings) * Math.PI * 2;
		const found = firstFitAlong({ ...fallback, rotation: bearing + QuarterTurn }, bearing, surroundings);
		if (found) return found;
	}
	return fallback;
}

function firstFitAlong(site: FacilitySite, bearing: number, surroundings: SiteSurroundings): FacilitySite | null {
	for (let feet = 0; feet < Search.FarthestFeet; feet += Search.StepFeet) {
		const centre = pointToward(site.centre, bearing, feet, surroundings);
		if (isInWater(surroundings.layout, centre)) continue;
		const candidate = { ...site, centre };
		const failures = siteFitFailures(candidate, surroundings);
		if (failures.length === 0) return candidate;
	}
	return null;
}

function pointToward(from: LayoutPoint, bearing: number, feet: number, surroundings: SiteSurroundings): LayoutPoint {
	const across = fractionAcrossForFeet(surroundings.scale, Math.cos(bearing) * feet);
	const down = fractionDownForFeet(surroundings.scale, Math.sin(bearing) * feet);
	return { x: from.x + across, y: from.y + down };
}

function openWaterSpot({ layout }: SiteSurroundings): LayoutPoint {
	const centre = lakeCentroid(layout);
	const [firstBankPoint] = layout.outline;
	return isInWater(layout, centre) ? centre : firstBankPoint;
}
