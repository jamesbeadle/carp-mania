import { Vector3 } from 'three';
import { swimPoint } from '$lib/domain/layout/swimRules';
import type { Swim } from '$lib/domain/types';
import { toFraction, type Point } from '../../scene/lakeShape';
import { fractionOf, worldPointOf, type LakeFrame, type WorldPoint } from '../lakeFrame';
import { headingOverTheWater, podSpotFacing, type WaterShape } from '../swimFacing';
import { pointToward } from '../worldGeometry';
import { toScene } from '../../scene/lakeShape';

export interface SwimSpot {
	swimId: string;
	peg: WorldPoint;
	pod: WorldPoint;
	heading: number;
	net: Vector3;
}

const NetOutMetres = 2.5;
const NetDepth = -0.25;

export function swimSpotOf(swim: Swim, frame: LakeFrame, water: WaterShape): SwimSpot {
	const peg = worldPointOf(frame, swimPoint(swim));
	const heading = headingOverTheWater(peg, water);
	const pod = podSpotFacing(peg, heading, water);
	const net = pointToward(pod, heading, NetOutMetres);
	return { swimId: swim.id, peg, pod, heading, net: new Vector3(net.x, NetDepth, net.z) };
}

export function worldOfScenePoint(frame: LakeFrame, point: Point) {
	const world = worldPointOf(frame, toFraction(point));
	return new Vector3(world.x, 0, world.z);
}

export function scenePointOfWorld(frame: LakeFrame, point: WorldPoint): Point {
	return toScene(fractionOf(frame, point));
}
