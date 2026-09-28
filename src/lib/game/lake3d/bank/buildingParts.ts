import { Group } from 'three';
import { block } from './buildingLook';
import { pitchedRoof } from './roofParts';
import { chimney, doorway, plinthAndCorners } from './wallParts';
import { windowsAround } from './windowParts';

export interface HousePlan {
	width: number;
	depth: number;
	wallHeight: number;
	walls: string;
	roof: string;
	windows: number;
	storeys?: number;
	hasChimney?: boolean;
}

const RoofRise = 0.6;
const ChimneyAlong = 0.3;

function windowsOnEveryStorey(plan: HousePlan) {
	const storeys = plan.storeys ?? 1;
	const height = plan.wallHeight / storeys;
	return Array.from({ length: storeys }, (_, storey) => windowsAround({ width: plan.width, depth: plan.depth, height, lift: storey * height }, plan.windows, storey === 0));
}

export function house(plan: HousePlan) {
	const { width, depth, wallHeight } = plan;
	const walls = { width, depth, height: wallHeight };
	const rise = wallHeight * RoofRise;
	const groundFloor = { width, depth, height: wallHeight / (plan.storeys ?? 1) };
	const group = new Group().add(block(width, wallHeight, depth, plan.walls), plinthAndCorners(walls), doorway(groundFloor));
	const chimneys = plan.hasChimney ? [chimney(width * ChimneyAlong, wallHeight + rise)] : [];
	return group.add(pitchedRoof({ width, depth, rise, lift: wallHeight }, plan.roof, plan.walls), ...windowsOnEveryStorey(plan), ...chimneys);
}
