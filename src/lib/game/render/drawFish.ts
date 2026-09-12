import type { SwimmingFish } from '../scene/fishSchool';
import { fishVisibility } from '../scene/fishPalette';
import { carpProportions, drawCarp } from './drawCarp';
import { drawPike } from './drawPike';

const CarpLength = { Base: 18, PerPound: 0.9 } as const;
const PikeLength = 52;

export function drawFishSchool(context: CanvasRenderingContext2D, school: SwimmingFish[], lake: Path2D, transparency: number, timeSeconds: number) {
	context.save();
	context.clip(lake);
	context.globalAlpha = fishVisibility(transparency);
	for (const fish of school) drawOneFish(context, fish, timeSeconds);
	context.restore();
}

function drawOneFish(context: CanvasRenderingContext2D, fish: SwimmingFish, timeSeconds: number) {
	context.save();
	context.translate(fish.position.x, fish.position.y);
	context.rotate(fish.heading);
	if (fish.isPike) drawPike(context, PikeLength, timeSeconds, fish.phase);
	if (!fish.isPike) drawCarp(context, fish.strain, carpProportions(CarpLength.Base + fish.weightPounds * CarpLength.PerPound), timeSeconds, fish.phase);
	context.restore();
}
