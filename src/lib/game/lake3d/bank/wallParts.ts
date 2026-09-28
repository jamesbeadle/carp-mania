import { Group } from 'three';
import { BuildingLook, surface } from './buildingLook';
import { mergedBoxes, type BoxSpec } from './mergedBoxes';

export interface Walls {
	width: number;
	depth: number;
	height: number;
}

const Plinth = { Height: 0.4, Proud: 0.05 } as const;
const Corner = { Width: 0.16 } as const;
const Door = { Width: 1, HeightShare: 0.68, Leaf: 0.06, Frame: 0.09, Panel: 0.02 } as const;
const Canopy = { Depth: 0.9, Overhang: 0.35, Thickness: 0.1, Rise: 0.25, Bracket: 0.08 } as const;
const Step = { Height: 0.16, Depth: 0.45, Overhang: 0.3 } as const;
const Chimney = { Size: 0.8, Above: 1.4, Cap: 0.14, CapProud: 0.08, Pot: 0.22 } as const;

export function plinthAndCorners(walls: Walls) {
	const { width, depth, height } = walls;
	const plinth = mergedBoxes([{ size: [width + Plinth.Proud * 2, Plinth.Height, depth + Plinth.Proud * 2], at: [0, Plinth.Height / 2, 0] }], surface(BuildingLook.Brick));
	const corners = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([across, along]): BoxSpec => ({ size: [Corner.Width, height, Corner.Width], at: [(across * width) / 2, height / 2, (along * depth) / 2] }));
	return new Group().add(plinth, mergedBoxes(corners, surface(BuildingLook.Trim)));
}

export function doorway(walls: Walls, across = 0) {
	const height = walls.height * Door.HeightShare;
	const front = walls.depth / 2;
	const frame: BoxSpec[] = [
		{ size: [Door.Frame, height, Door.Frame], at: [across - Door.Width / 2 - Door.Frame / 2, height / 2, front + Door.Frame / 2] },
		{ size: [Door.Frame, height, Door.Frame], at: [across + Door.Width / 2 + Door.Frame / 2, height / 2, front + Door.Frame / 2] },
		{ size: [Door.Width + Door.Frame * 2, Door.Frame, Door.Frame], at: [across, height + Door.Frame / 2, front + Door.Frame / 2] }
	];
	const canopyLift = height + Door.Frame + Canopy.Rise;
	const canopy: BoxSpec = { size: [Door.Width + Canopy.Overhang * 2, Canopy.Thickness, Canopy.Depth], at: [across, canopyLift, front + Canopy.Depth / 2], tilt: -0.18 };
	const step: BoxSpec = { size: [Door.Width + Step.Overhang * 2, Step.Height, Step.Depth], at: [across, Step.Height / 2, front + Step.Depth / 2] };
	const leaf = mergedBoxes([{ size: [Door.Width, height, Door.Leaf], at: [across, height / 2, front + Door.Leaf / 2] }], surface(BuildingLook.Door, 0.5));
	return new Group().add(leaf, mergedBoxes(frame, surface(BuildingLook.Trim)), mergedBoxes([canopy], surface(BuildingLook.Slate)), mergedBoxes([step], surface(BuildingLook.Brick)));
}

export function chimney(across: number, roofTop: number) {
	const height = roofTop + Chimney.Above;
	const stack: BoxSpec = { size: [Chimney.Size, height, Chimney.Size], at: [across, height / 2, 0] };
	const cap: BoxSpec = { size: [Chimney.Size + Chimney.CapProud * 2, Chimney.Cap, Chimney.Size + Chimney.CapProud * 2], at: [across, height, 0] };
	const pots: BoxSpec[] = [-1, 1].map((side) => ({ size: [Chimney.Pot, Chimney.Pot * 1.6, Chimney.Pot], at: [across + (side * Chimney.Size) / 4, height + Chimney.Pot, 0] }));
	return new Group().add(mergedBoxes([stack], surface(BuildingLook.Brick)), mergedBoxes([cap], surface(BuildingLook.Trim)), mergedBoxes(pots, surface(BuildingLook.Tile)));
}
