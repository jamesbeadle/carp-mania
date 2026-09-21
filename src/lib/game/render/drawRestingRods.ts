import type { Point } from '../scene/lakeShape';
import { AnglerPalette } from '../scene/palette';
import { isCastingNext, type RodOnBank } from '../scene/rodState';
import { drawCanvasLabel } from './drawCanvasLabel';

const Resting = { Length: 22, LeanBack: 0.55, LineWidth: 2.5 } as const;
const Halo = { Radius: 7, Swell: 2, Speed: 4 } as const;

export function drawRestingRods(context: CanvasRenderingContext2D, rests: Point[], facing: number, rods: RodOnBank[], timeSeconds: number) {
	rods.forEach((rod, index) => {
		if (rod.phase !== 'idle') return;
		const isNext = isCastingNext(rod, rods);
		if (isNext) drawHalo(context, rests[index], timeSeconds);
		drawRestingRod(context, rests[index], facing, isNext);
		if (isNext) drawCanvasLabel(context, rests[index], `Rod ${rod.index + 1} next`, AnglerPalette.CastingNext, true);
	});
}

function drawRestingRod(context: CanvasRenderingContext2D, rest: Point, facing: number, isNext: boolean) {
	const angle = facing + Math.PI * Resting.LeanBack;
	const butt = { x: rest.x - Math.cos(angle) * Resting.Length, y: rest.y - Math.sin(angle) * Resting.Length };
	context.strokeStyle = isNext ? AnglerPalette.CastingNext : AnglerPalette.RestingRod;
	context.lineWidth = Resting.LineWidth;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(butt.x, butt.y);
	context.lineTo(rest.x, rest.y);
	context.stroke();
}

function drawHalo(context: CanvasRenderingContext2D, rest: Point, timeSeconds: number) {
	const radius = Halo.Radius + Math.sin(timeSeconds * Halo.Speed) * Halo.Swell;
	context.fillStyle = AnglerPalette.CastingNextHalo;
	context.beginPath();
	context.arc(rest.x, rest.y, radius, 0, Math.PI * 2);
	context.fill();
}
