import { Group } from 'three';
import type { Facility } from '$lib/domain/layout/layoutTypes';
import { block, BuildingLook, house, windowsAlong } from './buildingParts';
import { clubHouse, estateHouse, washrooms } from './comfortModels';

export interface FacilityModel {
	build: () => Group;
	footprintMetres: number;
	isInTheWater?: boolean;
}

const CarColours = ['#8a1d1d', '#1d3f8a', '#d9d9d9', '#2a2a2a', '#3f6a3a'];

function car(colour: string, across: number) {
	const body = block(1.8, 0.7, 4.2, colour, 0.3);
	const cabin = block(1.6, 0.6, 2.2, colour, 1);
	const group = new Group().add(body, cabin);
	group.position.setX(across);
	return group;
}

function carPark() {
	const pad = block(22, 0.08, 14, BuildingLook.Gravel);
	const cars = CarColours.slice(0, 3).map((colour, index) => car(colour, -6 + index * 4.5));
	return new Group().add(pad, ...cars);
}

function hotel() {
	const group = new Group().add(house(28, 12, 7, BuildingLook.Render, BuildingLook.Slate, 10));
	group.add(windowsAlong(28, 3.5, 12, 3.6, 10));
	return group;
}

function aerator() {
	const float = block(1.2, 0.3, 1.2, '#dfe6ea', -0.15);
	const spray = block(0.25, 1.4, 0.25, '#f2f7f2', 0.1);
	return new Group().add(float, spray);
}

export const FacilityModels: Record<Facility, FacilityModel> = {
	car_park: { build: carPark, footprintMetres: 24 },
	lodge: { build: () => house(8, 6, 3, BuildingLook.Timber, BuildingLook.GreenRoof, 2), footprintMetres: 11 },
	toilets: { build: () => house(5, 3.5, 2.6, BuildingLook.Render, BuildingLook.Slate, 1), footprintMetres: 7 },
	washrooms: { build: washrooms, footprintMetres: 10 },
	club_house: { build: clubHouse, footprintMetres: 19 },
	estate_house: { build: estateHouse, footprintMetres: 34 },
	tackle_shop: { build: () => house(7, 5, 3, BuildingLook.DarkTimber, BuildingLook.GreenRoof, 2), footprintMetres: 9 },
	bar: { build: () => house(12, 8, 3.4, BuildingLook.Timber, BuildingLook.Tile, 4), footprintMetres: 15 },
	restaurant: { build: () => house(16, 10, 3.8, BuildingLook.Render, BuildingLook.Tile, 6), footprintMetres: 19 },
	hotel: { build: hotel, footprintMetres: 31 },
	aerator: { build: aerator, footprintMetres: 3, isInTheWater: true }
};
