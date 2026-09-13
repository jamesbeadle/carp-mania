import type { Swim } from '$lib/domain/types';
import { toScene, type Point } from '../scene/lakeShape';
import { BankPalette } from '../scene/palette';
import { drawCanvasLabel, labelAnchorBehind } from './drawCanvasLabel';

export const SwimPegRadius = 16;

const LabelBehindPeg = 36;

const Platform = { HalfWidth: SwimPegRadius, HalfDepth: SwimPegRadius * 0.6, Corner: 4, PlankSpacing: 6, HoverLift: 2 } as const;
const ChosenRing = { Radius: SwimPegRadius * 1.7, LineWidth: 2.5, GlowRadius: SwimPegRadius * 2.6 } as const;

export function swimScenePoint(swim: Swim): Point {
	return toScene({ x: Number(swim.position_x), y: Number(swim.position_y) });
}

export function drawPegs(context: CanvasRenderingContext2D, swims: Swim[], selectedSwimId: string | null, hoveredSwimId: string | null) {
	for (const swim of swims) {
		const point = swimScenePoint(swim);
		const isSelected = swim.id === selectedSwimId;
		if (isSelected) drawChosenRing(context, point);
		drawPeg(context, point, swim.id === hoveredSwimId || isSelected);
	}
}

export function drawSwimLabels(context: CanvasRenderingContext2D, swims: Swim[], selectedSwimId: string | null, facingWaterFrom: (peg: Point) => number) {
	for (const swim of swims) {
		const point = swimScenePoint(swim);
		drawCanvasLabel(context, labelAnchorBehind(point, facingWaterFrom(point), LabelBehindPeg), swim.name, BankPalette.Label, swim.id === selectedSwimId);
	}
}

function drawChosenRing(context: CanvasRenderingContext2D, point: Point) {
	const glow = context.createRadialGradient(point.x, point.y, ChosenRing.Radius * 0.6, point.x, point.y, ChosenRing.GlowRadius);
	glow.addColorStop(0, BankPalette.PegChosenGlow);
	glow.addColorStop(1, 'transparent');
	context.fillStyle = glow;
	context.beginPath();
	context.arc(point.x, point.y, ChosenRing.GlowRadius, 0, Math.PI * 2);
	context.fill();
	context.strokeStyle = BankPalette.PegChosenRing;
	context.lineWidth = ChosenRing.LineWidth;
	context.beginPath();
	context.arc(point.x, point.y, ChosenRing.Radius, 0, Math.PI * 2);
	context.stroke();
}

function drawPeg(context: CanvasRenderingContext2D, point: Point, isLifted: boolean) {
	context.save();
	context.translate(point.x, point.y - (isLifted ? Platform.HoverLift : 0));
	drawGroundShadow(context, isLifted);
	context.fillStyle = BankPalette.Peg;
	context.beginPath();
	context.roundRect(-Platform.HalfWidth, -Platform.HalfDepth, Platform.HalfWidth * 2, Platform.HalfDepth * 2, Platform.Corner);
	context.fill();
	drawPlanks(context);
	context.strokeStyle = isLifted ? BankPalette.PegLift : BankPalette.PegEdge;
	context.lineWidth = 1.5;
	context.beginPath();
	context.moveTo(-Platform.HalfWidth + Platform.Corner, -Platform.HalfDepth);
	context.lineTo(Platform.HalfWidth - Platform.Corner, -Platform.HalfDepth);
	context.stroke();
	context.restore();
}

function drawGroundShadow(context: CanvasRenderingContext2D, isLifted: boolean) {
	const drop = isLifted ? Platform.HoverLift * 2 : 2;
	context.fillStyle = BankPalette.PegShadow;
	context.beginPath();
	context.ellipse(0, Platform.HalfDepth + drop, Platform.HalfWidth + 2, Platform.HalfDepth * 0.5 + drop, 0, 0, Math.PI * 2);
	context.fill();
}

function drawPlanks(context: CanvasRenderingContext2D) {
	context.strokeStyle = BankPalette.PegPlank;
	context.lineWidth = 1;
	for (let plank = -Platform.HalfWidth + Platform.PlankSpacing; plank < Platform.HalfWidth; plank += Platform.PlankSpacing) {
		context.beginPath();
		context.moveTo(plank, -Platform.HalfDepth + 1);
		context.lineTo(plank, Platform.HalfDepth - 1);
		context.stroke();
	}
}
