import { BankPalette, SceneSize } from '../scene/palette';

export function drawBank(context: CanvasRenderingContext2D, lake: Path2D) {
	const grass = context.createLinearGradient(0, 0, 0, SceneSize.Height);
	grass.addColorStop(0, BankPalette.GrassFar);
	grass.addColorStop(1, BankPalette.GrassNear);
	context.fillStyle = grass;
	context.fillRect(0, 0, SceneSize.Width, SceneSize.Height);

	drawShoreline(context, lake);
	drawTufts(context);
}

function drawShoreline(context: CanvasRenderingContext2D, lake: Path2D) {
	context.save();
	context.lineWidth = 14;
	context.strokeStyle = BankPalette.Shore;
	context.stroke(lake);
	context.restore();
}

function drawTufts(context: CanvasRenderingContext2D) {
	context.save();
	context.strokeStyle = BankPalette.Reed;
	context.lineWidth = 1.5;
	for (let index = 0; index < 90; index++) {
		const x = ((index * 137) % SceneSize.Width) + 4;
		const y = ((index * 89) % SceneSize.Height) + 4;
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x - 3, y - 7);
		context.moveTo(x, y);
		context.lineTo(x + 3, y - 6);
		context.stroke();
	}
	context.restore();
}
