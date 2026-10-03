import type { Facility } from '../../layout/layoutTypes';

export interface SiteSize {
	widthFeet: number;
	depthFeet: number;
}

export const BuildingSizes: Record<Exclude<Facility, 'car_park'>, SiteSize> = {
	lodge: { widthFeet: 32, depthFeet: 22 },
	aerator: { widthFeet: 10, depthFeet: 10 },
	toilets: { widthFeet: 18, depthFeet: 12 },
	washrooms: { widthFeet: 32, depthFeet: 20 },
	club_house: { widthFeet: 52, depthFeet: 32 },
	estate_house: { widthFeet: 72, depthFeet: 46 },
	tackle_shop: { widthFeet: 26, depthFeet: 18 },
	bar: { widthFeet: 42, depthFeet: 28 },
	restaurant: { widthFeet: 54, depthFeet: 36 },
	hotel: { widthFeet: 96, depthFeet: 54 }
};

export const FacilitiesInTheWater: Facility[] = ['aerator'];

export function isPlacedInTheWater(facility: Facility) {
	return FacilitiesInTheWater.includes(facility);
}
