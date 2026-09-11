import type { Point } from '../scene/lakeShape';
import { AnglerPalette } from '../scene/palette';
import type { RodOnBank } from '../scene/rodState';

const RodLength = 34;

export function drawRods(context: CanvasRenderingContext2D, angler: Point, rods: RodOnBank[], timeSeconds: number) {
	rods.forEach((rod, index) => {
		if (rod.phase === 'idle' || !rod.baitPoint) return;
		const restPoint = rodRestPoint(angler, index, rods.length);
		const shake = rod.phase === 'biting' ? Math.sin(timeSeconds * 40) * 3 : rod.phase === 'fighting' ? Math.sin(timeSeconds * 12) * 5 : 0;
		const tip = rodTip(restPoint, rod.baitPoint, shake);
		drawRod(context, restPoint, tip);
		drawLine(context, tip, rod.baitPoint, rod.phase === 'fighting');
		drawBaitMarker(context, rod.baitPoint, rod.phase, timeSeconds);
	});
}

export function rodRestPoint(angler: Point, index: number, rodCount: number): Point {
	const spread = (index - (rodCount - 1) / 2) * 16;
	return { x: angler.x + spread, y: angler.y + 10 };
}

function rodTip(rest: Point, bait: Point, shake: number): Point {
	const angle = Math.atan2(bait.y - rest.y, bait.x - rest.x);
	return { x: rest.x + Math.cos(angle) * RodLength + shake, y: rest.y + Math.sin(angle) * RodLength };
}

function drawRod(context: CanvasRenderingContext2D, rest: Point, tip: Point) {
	context.strokeStyle = AnglerPalette.Rod;
	context.lineWidth = 3;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(rest.x, rest.y);
	context.lineTo(tip.x, tip.y);
	context.stroke();
}

function drawLine(context: CanvasRenderingContext2D, tip: Point, bait: Point, isTight: boolean) {
	context.strokeStyle = AnglerPalette.Line;
	context.lineWidth = isTight ? 1.5 : 1;
	context.beginPath();
	context.moveTo(tip.x, tip.y);
	context.lineTo(bait.x, bait.y);
	context.stroke();
}

function drawBaitMarker(context: CanvasRenderingContext2D, bait: Point, phase: RodOnBank['phase'], timeSeconds: number) {
	const isDisturbed = phase === 'biting' || phase === 'fighting';
	if (isDisturbed) drawRipples(context, bait, timeSeconds);
	context.fillStyle = 'hsla(0 0% 100% / 0.7)';
	context.beginPath();
	context.arc(bait.x, bait.y, 2.5, 0, Math.PI * 2);
	context.fill();
}

export function drawRipples(context: CanvasRenderingContext2D, centre: Point, timeSeconds: number) {
	context.strokeStyle = 'hsla(0 0% 100% / 0.35)';
	context.lineWidth = 1.5;
	for (let ring = 0; ring < 3; ring++) {
		const radius = ((timeSeconds * 18 + ring * 9) % 27) + 3;
		context.beginPath();
		context.arc(centre.x, centre.y, radius, 0, Math.PI * 2);
		context.stroke();
	}
}
