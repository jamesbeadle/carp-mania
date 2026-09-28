import { Group } from 'three';
import { BuildingLook, surface } from './buildingLook';
import { mergedBoxes, type BoxSpec } from './mergedBoxes';
import { WindowGlass } from './windowGlow';

export interface Wall {
	width: number;
	depth: number;
	height: number;
	lift: number;
}

interface Face {
	x: number;
	z: number;
	turn: number;
}

interface WindowBoxes {
	glass: BoxSpec[];
	trim: BoxSpec[];
}

const Pane = { SillShare: 0.35, HeightShare: 0.36, Widest: 1.4, ShareOfBay: 0.5 } as const;
const Frame = { Width: 0.08, Depth: 0.1, Bar: 0.045, TransomShare: 0.12, SillOverhang: 0.15, SillHeight: 0.07, SillDepth: 0.18 } as const;
const GableBay = 5;
const DoorClearance = 1.1;

function onFace(face: Face, local: BoxSpec): BoxSpec {
	const [x, y, z] = local.at;
	const cos = Math.cos(face.turn);
	const sin = Math.sin(face.turn);
	return { size: local.size, at: [face.x + x * cos + z * sin, y, face.z - x * sin + z * cos], turn: face.turn };
}

function windowAt(width: number, height: number, middle: number, face: Face, into: WindowBoxes) {
	const sideways = width / 2 + Frame.Width / 2;
	const upDown = height / 2 + Frame.Width / 2;
	into.glass.push(onFace(face, { size: [width, height, 0.04], at: [0, middle, 0.02] }));
	const trim: BoxSpec[] = [
		{ size: [width + Frame.Width * 2, Frame.Width, Frame.Depth], at: [0, middle + upDown, Frame.Depth / 2] },
		{ size: [Frame.Width, height, Frame.Depth], at: [-sideways, middle, Frame.Depth / 2] },
		{ size: [Frame.Width, height, Frame.Depth], at: [sideways, middle, Frame.Depth / 2] },
		{ size: [Frame.Bar, height, Frame.Depth * 0.6], at: [0, middle, Frame.Depth / 2] },
		{ size: [width, Frame.Bar, Frame.Depth * 0.6], at: [0, middle + height * Frame.TransomShare, Frame.Depth / 2] },
		{ size: [width + Frame.SillOverhang * 2, Frame.SillHeight, Frame.SillDepth], at: [0, middle - upDown, Frame.SillDepth / 2] }
	];
	into.trim.push(...trim.map((box) => onFace(face, box)));
}

function rowOn(length: number, count: number, wall: Wall, face: Face, into: WindowBoxes, hasDoor = false) {
	const width = Math.min(Pane.Widest, (length / count) * Pane.ShareOfBay);
	const height = wall.height * Pane.HeightShare;
	const middle = wall.lift + wall.height * Pane.SillShare + height / 2;
	for (let index = 0; index < count; index++) {
		const across = -length / 2 + (index + 0.5) * (length / count);
		const isOverTheDoor = hasDoor && Math.abs(across) < DoorClearance;
		const bay = { ...face, x: face.x + across * Math.cos(face.turn), z: face.z - across * Math.sin(face.turn) };
		if (!isOverTheDoor) windowAt(width, height, middle, bay, into);
	}
}

export function windowsAround(wall: Wall, count: number, hasDoor = false) {
	const boxes: WindowBoxes = { glass: [], trim: [] };
	const gableCount = Math.max(1, Math.floor(wall.depth / GableBay));
	rowOn(wall.width, count, wall, { x: 0, z: wall.depth / 2, turn: 0 }, boxes, hasDoor);
	rowOn(wall.width, count, wall, { x: 0, z: -wall.depth / 2, turn: Math.PI }, boxes);
	rowOn(wall.depth, gableCount, wall, { x: wall.width / 2, z: 0, turn: Math.PI / 2 }, boxes);
	rowOn(wall.depth, gableCount, wall, { x: -wall.width / 2, z: 0, turn: -Math.PI / 2 }, boxes);
	return new Group().add(mergedBoxes(boxes.glass, WindowGlass), mergedBoxes(boxes.trim, surface(BuildingLook.Trim)));
}
