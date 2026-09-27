import { Group } from 'three';
import { block, BuildingLook, house, pitchedRoof, windowsAlong } from './buildingParts';

const Door = { Width: 1, HeightShare: 0.65, Thickness: 0.1, Proud: 0.03 } as const;
const Canopy = { Thickness: 0.15 } as const;
const Forecourt = { Thickness: 0.06 } as const;
const WingWindows = 3;
const ChimneyLift = 1;
const RoofRiseShare = 0.5;
const Washrooms = { Width: 8, Depth: 5, Walls: 2.8, Windows: 3, DoorGap: 2.4 } as const;
const ClubHouse = { Width: 14, Depth: 9, Walls: 3.4, Windows: 5, Veranda: 3, DeckHeight: 0.25, PostEvery: 3.5, PostSize: 0.18 } as const;
const Estate = { Width: 14, Depth: 12, Walls: 6.5, Windows: 5, WingWidth: 8, WingDepth: 10, WingWalls: 4.5, WingOut: 11, Forecourt: 22, ForecourtDepth: 9, Chimney: 0.9, ChimneyHeight: 2.2 } as const;

function secondDoor(width: number, depth: number, walls: number) {
	const door = block(Door.Width, walls * Door.HeightShare, Door.Thickness, BuildingLook.Door);
	door.position.setX(width / 2 - Washrooms.DoorGap);
	door.position.setZ(depth / 2 + Door.Proud);
	return door;
}

export function washrooms() {
	return new Group().add(house(Washrooms.Width, Washrooms.Depth, Washrooms.Walls, BuildingLook.Render, BuildingLook.Slate, Washrooms.Windows), secondDoor(Washrooms.Width, Washrooms.Depth, Washrooms.Walls));
}

function veranda() {
	const group = new Group();
	const deck = block(ClubHouse.Width, ClubHouse.DeckHeight, ClubHouse.Veranda, BuildingLook.DarkTimber);
	group.add(deck);
	for (let across = -ClubHouse.Width / 2; across <= ClubHouse.Width / 2; across += ClubHouse.PostEvery) {
		const post = block(ClubHouse.PostSize, ClubHouse.Walls, ClubHouse.PostSize, BuildingLook.DarkTimber, ClubHouse.DeckHeight);
		post.position.setX(across);
		group.add(post);
	}
	const canopy = block(ClubHouse.Width, Canopy.Thickness, ClubHouse.Veranda, BuildingLook.GreenRoof, ClubHouse.Walls + ClubHouse.DeckHeight);
	group.add(canopy);
	group.position.setZ(ClubHouse.Depth / 2 + ClubHouse.Veranda / 2);
	return group;
}

export function clubHouse() {
	return new Group().add(house(ClubHouse.Width, ClubHouse.Depth, ClubHouse.Walls, BuildingLook.Timber, BuildingLook.GreenRoof, ClubHouse.Windows), veranda());
}

function wing(side: number) {
	const group = house(Estate.WingWidth, Estate.WingDepth, Estate.WingWalls, BuildingLook.Render, BuildingLook.Slate, WingWindows);
	group.position.setX(side * Estate.WingOut);
	return group;
}

function chimney(across: number) {
	const stack = block(Estate.Chimney, Estate.ChimneyHeight, Estate.Chimney, BuildingLook.Tile, Estate.Walls + ChimneyLift);
	stack.position.setX(across);
	return stack;
}

export function estateHouse() {
	const centre = new Group().add(block(Estate.Width, Estate.Walls, Estate.Depth, BuildingLook.Render), pitchedRoof(Estate.Width, Estate.Depth, Estate.Walls * RoofRiseShare, BuildingLook.Slate, Estate.Walls));
	centre.add(windowsAlong(Estate.Width, Estate.Walls / 2, Estate.Depth, 0, Estate.Windows), windowsAlong(Estate.Width, Estate.Walls / 2, Estate.Depth, Estate.Walls / 2, Estate.Windows));
	const forecourt = block(Estate.Forecourt, Forecourt.Thickness, Estate.ForecourtDepth, BuildingLook.Gravel);
	forecourt.position.setZ(Estate.Depth / 2 + Estate.ForecourtDepth / 2);
	return new Group().add(centre, wing(-1), wing(1), chimney(-Estate.Width / 3), chimney(Estate.Width / 3), forecourt);
}
