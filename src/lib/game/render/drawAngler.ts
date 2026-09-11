import type { Point } from '../scene/lakeShape';
import { AnglerPalette } from '../scene/palette';

export function drawAngler(context: CanvasRenderingContext2D, position: Point, facing: number) {
	context.save();
	context.translate(position.x, position.y);
	drawBivvy(context);
	context.rotate(facing);
	context.fillStyle = AnglerPalette.Jacket;
	context.beginPath();
	context.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = AnglerPalette.Skin;
	context.beginPath();
	context.arc(2, 0, 5, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = AnglerPalette.Hat;
	context.beginPath();
	context.arc(2, 0, 6, Math.PI * 0.5, Math.PI * 1.5);
	context.fill();
	context.restore();
}

function drawBivvy(context: CanvasRenderingContext2D) {
	context.fillStyle = AnglerPalette.Bivvy;
	context.beginPath();
	context.ellipse(-22, -18, 16, 12, 0, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = 'hsla(0 0% 0% / 0.2)';
	context.beginPath();
	context.ellipse(-22, -12, 12, 4, 0, 0, Math.PI);
	context.fill();
}
