import { toScene, type Point } from '../scene/lakeShape';
import { BankPalette, weedColour } from '../scene/palette';
import type { Swim } from '$lib/domain/types';

export function drawWeedBeds(context: CanvasRenderingContext2D, lake: Path2D, weed: number, timeSeconds: number) {
	const patchCount = Math.round((weed / 100) * 26);
	context.save();
	context.clip(lake);
	for (let index = 0; index < patchCount; index++) {
		const point = { x: 120 + ((index * 173) % 720), y: 90 + ((index * 131) % 460) };
		drawWeedPatch(context, point, 18 + (index % 4) * 8, timeSeconds + index);
	}
	context.restore();
}

function drawWeedPatch(context: CanvasRenderingContext2D, centre: Point, radius: number, phase: number) {
	context.fillStyle = weedColour(0.55);
	for (let frond = 0; frond < 6; frond++) {
		const angle = (frond / 6) * Math.PI * 2 + Math.sin(phase * 0.5) * 0.1;
		context.beginPath();
		context.ellipse(centre.x + Math.cos(angle) * radius * 0.4, centre.y + Math.sin(angle) * radius * 0.4, radius * 0.5, radius * 0.22, angle, 0, Math.PI * 2);
		context.fill();
	}
}

export function drawReeds(context: CanvasRenderingContext2D, swims: Swim[], timeSeconds: number) {
	const reedSwims = swims.filter((swim) => swim.feature === 'reed_line');
	for (const swim of reedSwims) drawReedCluster(context, toScene({ x: Number(swim.position_x), y: Number(swim.position_y) }), timeSeconds);
}

function drawReedCluster(context: CanvasRenderingContext2D, origin: Point, timeSeconds: number) {
	context.save();
	context.lineWidth = 2;
	for (let index = 0; index < 22; index++) {
		const x = origin.x + 30 + (index % 11) * 7 + Math.sin(index) * 3;
		const y = origin.y + 26 + Math.floor(index / 11) * 10;
		const sway = Math.sin(timeSeconds * 1.4 + index) * 3;
		context.strokeStyle = BankPalette.Reed;
		context.beginPath();
		context.moveTo(x, y);
		context.quadraticCurveTo(x + sway, y - 18, x + sway * 1.6, y - 34);
		context.stroke();
		context.fillStyle = BankPalette.ReedTip;
		context.fillRect(x + sway * 1.6 - 1.5, y - 40, 3, 7);
	}
	context.restore();
}
