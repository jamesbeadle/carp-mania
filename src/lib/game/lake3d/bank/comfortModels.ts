import { Group } from 'three';
import { block, BuildingLook } from './buildingLook';
import { house, type HousePlan } from './buildingParts';
import { terrace } from './facilityProps';
import { doorway } from './wallParts';

const Washrooms: HousePlan = { width: 8, depth: 5, wallHeight: 2.8, walls: BuildingLook.Render, roof: BuildingLook.Slate, windows: 3 };
const SecondDoorAcross = 2.4;
const ClubHouse: HousePlan = { width: 14, depth: 9, wallHeight: 3.4, walls: BuildingLook.Timber, roof: BuildingLook.GreenRoof, windows: 5, hasChimney: true };
const Veranda = { Depth: 3, DeckHeight: 0.25, PostEvery: 3.5, PostSize: 0.18, Canopy: 0.15, RailHeight: 0.9, Rail: 0.08 } as const;
const ClubTables = 3;
const Wing: HousePlan = { width: 8, depth: 10, wallHeight: 4.5, walls: BuildingLook.Render, roof: BuildingLook.Slate, windows: 3, hasChimney: true };
const Hall: HousePlan = { width: 14, depth: 12, wallHeight: 6.5, walls: BuildingLook.Render, roof: BuildingLook.Slate, windows: 5, storeys: 2, hasChimney: true };
const Estate = { WingOut: 11, Forecourt: 22, ForecourtDepth: 9, Gravel: 0.06 } as const;

export function washrooms() {
	return new Group().add(house(Washrooms), doorway({ width: Washrooms.width, depth: Washrooms.depth, height: Washrooms.wallHeight }, SecondDoorAcross));
}

function veranda() {
	const width = ClubHouse.width;
	const group = new Group().add(block(width, Veranda.DeckHeight, Veranda.Depth, BuildingLook.DarkTimber));
	for (let across = -width / 2; across <= width / 2; across += Veranda.PostEvery) {
		const post = block(Veranda.PostSize, ClubHouse.wallHeight, Veranda.PostSize, BuildingLook.DarkTimber, Veranda.DeckHeight);
		post.position.setX(across);
		post.position.setZ(Veranda.Depth / 2 - Veranda.PostSize);
		group.add(post);
	}
	const rail = block(width, Veranda.Rail, Veranda.Rail, BuildingLook.DarkTimber, Veranda.DeckHeight + Veranda.RailHeight);
	rail.position.setZ(Veranda.Depth / 2 - Veranda.PostSize);
	group.add(rail, block(width, Veranda.Canopy, Veranda.Depth, BuildingLook.GreenRoof, ClubHouse.wallHeight + Veranda.DeckHeight));
	group.position.setZ(ClubHouse.depth / 2 + Veranda.Depth / 2);
	return group;
}

export function clubHouse() {
	return new Group().add(house(ClubHouse), veranda(), terrace(ClubHouse.depth / 2 + Veranda.Depth, ClubTables));
}

function wing(side: number) {
	const group = house(Wing);
	group.position.setX(side * Estate.WingOut);
	return group;
}

export function estateHouse() {
	const forecourt = block(Estate.Forecourt, Estate.Gravel, Estate.ForecourtDepth, BuildingLook.Gravel);
	forecourt.position.setZ(Hall.depth / 2 + Estate.ForecourtDepth / 2);
	return new Group().add(house(Hall), wing(-1), wing(1), forecourt);
}
