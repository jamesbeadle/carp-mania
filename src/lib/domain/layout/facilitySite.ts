import type { Facility, LayoutPoint } from './layoutTypes';

export type CarParkSurface = 'gravel' | 'tarmac';
export const CarParkSurfaces: CarParkSurface[] = ['gravel', 'tarmac'];

export interface CarParkSpec {
	spaces: number;
	surface: CarParkSurface;
	isLit: boolean;
}

export interface SitePlacement {
	centre: LayoutPoint;
	rotation: number;
}

export interface FacilitySite extends SitePlacement {
	facility: Facility;
	carPark?: CarParkSpec;
}
