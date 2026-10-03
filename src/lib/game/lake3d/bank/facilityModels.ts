import { Group } from 'three';
import { StandardCarPark } from '$lib/domain/groundworks/sites/carParkPlan';
import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import type { Facility } from '$lib/domain/layout/layoutTypes';
import { aerator } from './aeratorModel';
import { BuildingLook } from './buildingLook';
import { house, type HousePlan } from './buildingParts';
import { carPark } from './carPark';
import { clubHouse, estateHouse, washrooms } from './comfortModels';
import { benchOut, hangingSign, terrace } from './facilityProps';

export interface FacilityModel {
	build: (site: FacilitySite) => Group;
	isInTheWater?: boolean;
}

const Lodge: HousePlan = { width: 8, depth: 6, wallHeight: 3, walls: BuildingLook.Timber, roof: BuildingLook.GreenRoof, windows: 2, hasChimney: true };
const Toilets: HousePlan = { width: 5, depth: 3.5, wallHeight: 2.6, walls: BuildingLook.Render, roof: BuildingLook.Slate, windows: 2 };
const TackleShop: HousePlan = { width: 7, depth: 5, wallHeight: 3, walls: BuildingLook.DarkTimber, roof: BuildingLook.GreenRoof, windows: 2 };
const Bar: HousePlan = { width: 12, depth: 8, wallHeight: 3.4, walls: BuildingLook.Timber, roof: BuildingLook.Tile, windows: 4, hasChimney: true };
const Restaurant: HousePlan = { width: 16, depth: 10, wallHeight: 3.8, walls: BuildingLook.Render, roof: BuildingLook.Tile, windows: 6, hasChimney: true };
const Hotel: HousePlan = { width: 28, depth: 12, wallHeight: 7, walls: BuildingLook.Render, roof: BuildingLook.Slate, windows: 10, storeys: 2, hasChimney: true };
const Terraces = { BarTables: 3, RestaurantTables: 4 } as const;
const BenchAcross = 2.4;

function withProps(plan: HousePlan, props: (front: number) => Group) {
	return () => new Group().add(house(plan), props(plan.depth / 2));
}

export const FacilityModels: Record<Facility, FacilityModel> = {
	car_park: { build: (site) => carPark(site.carPark ?? StandardCarPark) },
	lodge: { build: withProps(Lodge, (front) => new Group().add(benchOut(front, -BenchAcross), benchOut(front, BenchAcross))) },
	toilets: { build: () => house(Toilets) },
	washrooms: { build: washrooms },
	club_house: { build: clubHouse },
	estate_house: { build: estateHouse },
	tackle_shop: { build: withProps(TackleShop, (front) => new Group().add(hangingSign(front), benchOut(front, -BenchAcross))) },
	bar: { build: withProps(Bar, (front) => terrace(front, Terraces.BarTables)) },
	restaurant: { build: withProps(Restaurant, (front) => terrace(front, Terraces.RestaurantTables, true)) },
	hotel: { build: withProps(Hotel, (front) => new Group().add(benchOut(front, -BenchAcross * 2), benchOut(front, BenchAcross * 2))) },
	aerator: { build: aerator, isInTheWater: true }
};
