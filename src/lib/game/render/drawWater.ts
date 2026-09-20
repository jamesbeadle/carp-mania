import type { Point } from '../scene/lakeShape';
import { SceneSize } from '../scene/palette';
import { waterColour } from '../scene/waterPalette';

const DeepestRadius = 40;

export function drawWater(context: CanvasRenderingContext2D, lake: Path2D, centre: Point, transparency: number, timeSeconds: number) {
	const depth = context.createRadialGradient(centre.x, centre.y, DeepestRadius, centre.x, centre.y, SceneSize.Width * 0.5);
	depth.addColorStop(0, waterColour(transparency, 1));
	depth.addColorStop(1, waterColour(transparency, 0));
	context.save();
	context.fillStyle = depth;
	context.fill(lake);
	context.clip(lake);
	drawSheen(context, timeSeconds);
	context.restore();
}

function drawSheen(context: CanvasRenderingContext2D, timeSeconds: number) {
	context.save();
	context.strokeStyle = 'hsla(0 0% 100% / 0.06)';
	context.lineWidth = 2;
	for (let row = 0; row < 14; row++) {
		const y = 40 + row * 44 + Math.sin(timeSeconds * 0.6 + row) * 4;
		context.beginPath();
		for (let x = 0; x <= SceneSize.Width; x += 24) {
			const wave = Math.sin(x * 0.02 + timeSeconds * 0.8 + row * 0.7) * 5;
			context.lineTo(x, y + wave);
		}
		context.stroke();
	}
	context.restore();
}
