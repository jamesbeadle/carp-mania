import type { Point } from '../scene/lakeShape';
import { AnglerPalette } from '../scene/palette';
import { isCastingNext, type RodOnBank } from '../scene/rodState';

const Resting = { Length: 22, LeanBack: 0.55, LineWidth: 2.5, NextLineWidth: 4 } as const;
const Marker = { Ahead: 26, Height: 9, HalfWidth: 6, Bob: 3, Speed: 5, RingRadius: 10, RingWidth: 2.5 } as const;
const FullTurn = Math.PI * 2;

export function drawRestingRods(context: CanvasRenderingContext2D, rests: Point[], facing: number, rods: RodOnBank[], timeSeconds: number) {
	rods.forEach((rod, index) => {
		if (rod.phase !== 'idle') return;
		const isNext = isCastingNext(rod, rods);
		drawRestingRod(context, rests[index], facing, isNext);
		if (isNext) drawNextMarker(context, rests[index], facing, timeSeconds);
	});
}

function drawRestingRod(context: CanvasRenderingContext2D, rest: Point, facing: number, isNext: boolean) {
	const angle = facing + Math.PI * Resting.LeanBack;
	const back = Resting.Length;
	const butt = { x: rest.x - Math.cos(angle) * back, y: rest.y - Math.sin(angle) * back };
	context.strokeStyle = isNext ? AnglerPalette.CastingNext : AnglerPalette.RestingRod;
	context.lineWidth = isNext ? Resting.NextLineWidth : Resting.LineWidth;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(butt.x, butt.y);
	context.lineTo(rest.x, rest.y);
	context.stroke();
}

function drawNextMarker(context: CanvasRenderingContext2D, rest: Point, facing: number, timeSeconds: number) {
	context.strokeStyle = AnglerPalette.CastingNext;
	context.lineWidth = Marker.RingWidth;
	context.beginPath();
	context.arc(rest.x, rest.y, Marker.RingRadius, 0, FullTurn);
	context.stroke();
	drawChevronPointingAt(context, rest, facing, Marker.Ahead + Math.sin(timeSeconds * Marker.Speed) * Marker.Bob);
}

function drawChevronPointingAt(context: CanvasRenderingContext2D, target: Point, facing: number, distance: number) {
	context.save();
	context.translate(target.x, target.y);
	context.rotate(facing);
	context.fillStyle = AnglerPalette.CastingNext;
	context.beginPath();
	context.moveTo(distance + Marker.Height, 0);
	context.lineTo(distance, -Marker.HalfWidth);
	context.lineTo(distance, Marker.HalfWidth);
	context.closePath();
	context.fill();
	context.restore();
}
