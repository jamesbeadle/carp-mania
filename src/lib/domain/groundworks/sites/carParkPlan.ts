import type { CarParkSpec } from '../../layout/facilitySite';

export const CarParkRules = { MinimumSpaces: 6, MaximumSpaces: 120 } as const;
export const StandardCarPark: CarParkSpec = { spaces: 20, surface: 'gravel', isLit: false };

const Bay = { WidthFeet: 8, LengthFeet: 16 } as const;
const AisleFeet = 20;
const VergeFeet = 6;
const MostBaysInARow = 15;
const RowsPerBlock = 2;

export interface ParkingBay {
	acrossFeet: number;
	downFeet: number;
	isFacingDown: boolean;
}

export interface CarParkPlan {
	widthFeet: number;
	depthFeet: number;
	bays: ParkingBay[];
	aislesDownFeet: number[];
}

interface Blocks {
	count: number;
	columns: number;
}

const BlockDepthFeet = Bay.LengthFeet * RowsPerBlock + AisleFeet;

function blocksFor(spaces: number): Blocks {
	const count = Math.ceil(spaces / (MostBaysInARow * RowsPerBlock));
	return { count, columns: Math.ceil(spaces / (count * RowsPerBlock)) };
}

export function carParkPlanFor(spec: CarParkSpec): CarParkPlan {
	const blocks = blocksFor(spec.spaces);
	const widthFeet = blocks.columns * Bay.WidthFeet + VergeFeet * 2;
	const depthFeet = blocks.count * BlockDepthFeet + VergeFeet * 2;
	const bays = Array.from({ length: spec.spaces }, (_, index) => bayAt(index, blocks, widthFeet, depthFeet));
	const aislesDownFeet = Array.from({ length: blocks.count }, (_, block) => blockTopFeet(block, depthFeet) + Bay.LengthFeet + AisleFeet / 2);
	return { widthFeet, depthFeet, bays, aislesDownFeet };
}

function blockTopFeet(block: number, depthFeet: number) {
	return -depthFeet / 2 + VergeFeet + block * BlockDepthFeet;
}

function bayAt(index: number, blocks: Blocks, widthFeet: number, depthFeet: number): ParkingBay {
	const baysPerBlock = blocks.columns * RowsPerBlock;
	const withinBlock = index % baysPerBlock;
	const isFacingDown = withinBlock < blocks.columns;
	const column = withinBlock % blocks.columns;
	const top = blockTopFeet(Math.floor(index / baysPerBlock), depthFeet);
	const rowOffset = isFacingDown ? Bay.LengthFeet / 2 : Bay.LengthFeet + AisleFeet + Bay.LengthFeet / 2;
	return { acrossFeet: -widthFeet / 2 + VergeFeet + (column + 0.5) * Bay.WidthFeet, downFeet: top + rowOffset, isFacingDown };
}

export const ParkingBaySize = Bay;
