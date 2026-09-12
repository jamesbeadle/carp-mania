import { BankPalette } from '../scene/palette';

const IslandShoreWidth = 8;

export function drawIslands(context: CanvasRenderingContext2D, islands: Path2D[]) {
	context.save();
	context.fillStyle = BankPalette.GrassNear;
	context.strokeStyle = BankPalette.Shore;
	context.lineWidth = IslandShoreWidth;
	for (const island of islands) {
		context.fill(island);
		context.stroke(island);
	}
	context.restore();
}
