import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import type { SwimmingFish } from './fishSchool';
import { isInsideWater, type Point } from './lakeShape';

export interface WaterBody {
	context: CanvasRenderingContext2D;
	lake: Path2D;
	islands: Path2D[];
	layout: LakeLayout;
	centre: Point;
}

export interface ClearAhead {
	centre: boolean;
	left: boolean;
	right: boolean;
}

export const Whisker = { Angle: 0.6, ShortestPixels: 24, SecondsAhead: 2.4 } as const;

export function clearWaterAhead(fish: SwimmingFish, water: WaterBody): ClearAhead {
	const reach = Whisker.ShortestPixels + fish.speed * Whisker.SecondsAhead;
	return {
		centre: isClearTowards(fish, water, 0, reach),
		left: isClearTowards(fish, water, -Whisker.Angle, reach),
		right: isClearTowards(fish, water, Whisker.Angle, reach)
	};
}

export function isOpenWater(water: WaterBody, point: Point) {
	return isInsideWater(water.context, water.lake, water.islands, point);
}

function isClearTowards(fish: SwimmingFish, water: WaterBody, offset: number, reach: number) {
	const angle = fish.heading + offset;
	const probe = { x: fish.position.x + Math.cos(angle) * reach, y: fish.position.y + Math.sin(angle) * reach };
	return isOpenWater(water, probe);
}
