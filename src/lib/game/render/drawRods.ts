import type { Point } from '../scene/lakeShape';
import { AnglerPalette } from '../scene/palette';
import type { RodOnBank } from '../scene/rodState';
import { drawCanvasLabel } from './drawCanvasLabel';
import { drawRestingRods } from './drawRestingRods';

const Rest = { Forward: 12, Spread: 14 } as const;
const RodLength = 34;
const Shake = { Biting: { Speed: 40, Size: 3 }, Fighting: { Speed: 12, Size: 5 } } as const;
const Float = { Radius: 3, EdgeWidth: 1 } as const;
const Ripples = { Count: 3, Speed: 18, Spacing: 9, Reach: 27, Smallest: 3, LineWidth: 1.5 } as const;

export function drawRods(context: CanvasRenderingContext2D, angler: Point, facing: number, rods: RodOnBank[], timeSeconds: number) {
	const rests = rods.map((rod) => rodRestPoint(angler, facing, rod.index, rods.length));
	drawPod(context, rests);
	drawRestingRods(context, rests, facing, rods, timeSeconds);
	rods.forEach((rod, index) => {
		if (rod.phase === 'idle' || !rod.baitPoint) return;
		const tip = rodTip(rests[index], rod.baitPoint, shakeOf(rod, timeSeconds));
		drawRod(context, rests[index], tip);
		drawLine(context, tip, rod.baitPoint, rod.phase === 'fighting');
		drawFloat(context, rod, timeSeconds);
	});
}

export function rodRestPoint(angler: Point, facing: number, index: number, rodCount: number): Point {
	const across = (index - (rodCount - 1) / 2) * Rest.Spread;
	return {
		x: angler.x + Math.cos(facing) * Rest.Forward - Math.sin(facing) * across,
		y: angler.y + Math.sin(facing) * Rest.Forward + Math.cos(facing) * across
	};
}

function shakeOf(rod: RodOnBank, timeSeconds: number) {
	if (rod.phase === 'biting') return Math.sin(timeSeconds * Shake.Biting.Speed) * Shake.Biting.Size;
	if (rod.phase === 'fighting') return Math.sin(timeSeconds * Shake.Fighting.Speed) * Shake.Fighting.Size;
	return 0;
}

function rodTip(rest: Point, bait: Point, shake: number): Point {
	const angle = Math.atan2(bait.y - rest.y, bait.x - rest.x);
	return { x: rest.x + Math.cos(angle) * RodLength + shake, y: rest.y + Math.sin(angle) * RodLength };
}

function drawPod(context: CanvasRenderingContext2D, rests: Point[]) {
	if (rests.length < 2) return;
	const [first, last] = [rests[0], rests[rests.length - 1]];
	context.strokeStyle = AnglerPalette.Pod;
	context.lineWidth = 2.5;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(first.x, first.y);
	context.lineTo(last.x, last.y);
	context.stroke();
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
	context.strokeStyle = isTight ? AnglerPalette.LineTight : AnglerPalette.Line;
	context.lineWidth = isTight ? 1.5 : 1;
	context.beginPath();
	context.moveTo(tip.x, tip.y);
	context.lineTo(bait.x, bait.y);
	context.stroke();
}

function drawFloat(context: CanvasRenderingContext2D, rod: RodOnBank, timeSeconds: number) {
	const bait = rod.baitPoint as Point;
	const isDisturbed = rod.phase === 'biting' || rod.phase === 'fighting';
	if (isDisturbed) drawRipples(context, bait, timeSeconds);
	context.fillStyle = AnglerPalette.Float;
	context.strokeStyle = AnglerPalette.FloatEdge;
	context.lineWidth = Float.EdgeWidth;
	context.beginPath();
	context.arc(bait.x, bait.y, Float.Radius, 0, Math.PI * 2);
	context.fill();
	context.stroke();
	if (isDisturbed) drawCanvasLabel(context, bait, `Rod ${rod.index + 1}`, AnglerPalette.BiteTag, true);
}

function drawRipples(context: CanvasRenderingContext2D, centre: Point, timeSeconds: number) {
	context.strokeStyle = AnglerPalette.Ripple;
	context.lineWidth = Ripples.LineWidth;
	for (let ring = 0; ring < Ripples.Count; ring++) {
		const radius = ((timeSeconds * Ripples.Speed + ring * Ripples.Spacing) % Ripples.Reach) + Ripples.Smallest;
		context.beginPath();
		context.arc(centre.x, centre.y, radius, 0, Math.PI * 2);
		context.stroke();
	}
}
