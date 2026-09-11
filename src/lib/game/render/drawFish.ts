import type { SwimmingFish } from '../scene/fishSchool';
import { FishPalette, fishVisibility } from '../scene/palette';
import { drawBody, drawFins, drawLinearLine, drawMirrorScales, drawShadow, drawTail } from './fishBody';

const CarpLength = { Base: 16, PerPound: 0.8 } as const;
const PikeLength = 44;

export function drawFishSchool(context: CanvasRenderingContext2D, school: SwimmingFish[], lake: Path2D, transparency: number, timeSeconds: number) {
	context.save();
	context.clip(lake);
	context.globalAlpha = fishVisibility(transparency);
	for (const fish of school) drawOneFish(context, fish, timeSeconds);
	context.restore();
}

function drawOneFish(context: CanvasRenderingContext2D, fish: SwimmingFish, timeSeconds: number) {
	const length = fish.isPike ? PikeLength : CarpLength.Base + fish.weightPounds * CarpLength.PerPound;
	const width = fish.isPike ? length * 0.18 : length * 0.42;
	const colours = fish.isPike ? FishPalette.pike : FishPalette[fish.strain];
	const tailSway = Math.sin(timeSeconds * 6 + fish.phase) * width * 0.35;

	context.save();
	context.translate(fish.position.x, fish.position.y);
	context.rotate(fish.heading);
	drawShadow(context, length, width);
	drawTail(context, length, width, tailSway, colours.fin);
	drawFins(context, length, width, colours.fin);
	drawBody(context, length, width, colours.body, colours.belly);
	if (fish.strain === 'mirror' && !fish.isPike) drawMirrorScales(context, length, width, colours.belly);
	if (fish.strain === 'linear' && !fish.isPike) drawLinearLine(context, length, colours.belly);
	context.restore();
}
