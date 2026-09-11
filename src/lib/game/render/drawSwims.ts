import type { Swim } from '$lib/domain/types';
import { toScene, type Point } from '../scene/lakeShape';
import { BankPalette } from '../scene/palette';

export const SwimPegRadius = 16;

export function swimScenePoint(swim: Swim): Point {
	return toScene({ x: Number(swim.position_x), y: Number(swim.position_y) });
}

export function drawSwims(context: CanvasRenderingContext2D, swims: Swim[], selectedSwimId: string | null, hoveredSwimId: string | null) {
	for (const swim of swims) {
		const point = swimScenePoint(swim);
		const isSelected = swim.id === selectedSwimId;
		const isHovered = swim.id === hoveredSwimId;
		drawPeg(context, point, isSelected, isHovered);
		drawLabel(context, point, swim.name, isSelected);
	}
}

function drawPeg(context: CanvasRenderingContext2D, point: Point, isSelected: boolean, isHovered: boolean) {
	context.save();
	context.translate(point.x, point.y);
	context.fillStyle = isSelected ? BankPalette.PegSelected : BankPalette.Peg;
	context.strokeStyle = isHovered || isSelected ? BankPalette.Label : 'hsla(0 0% 0% / 0.35)';
	context.lineWidth = isHovered || isSelected ? 3 : 1.5;
	context.beginPath();
	context.roundRect(-SwimPegRadius, -SwimPegRadius * 0.6, SwimPegRadius * 2, SwimPegRadius * 1.2, 5);
	context.fill();
	context.stroke();
	context.strokeStyle = 'hsla(0 0% 0% / 0.25)';
	context.lineWidth = 1;
	for (let plank = -SwimPegRadius + 6; plank < SwimPegRadius; plank += 6) {
		context.beginPath();
		context.moveTo(plank, -SwimPegRadius * 0.6);
		context.lineTo(plank, SwimPegRadius * 0.6);
		context.stroke();
	}
	context.restore();
}

function drawLabel(context: CanvasRenderingContext2D, point: Point, name: string, isSelected: boolean) {
	context.save();
	context.font = `${isSelected ? '600 ' : ''}13px Inter, system-ui, sans-serif`;
	context.textAlign = 'center';
	context.fillStyle = 'hsla(0 0% 0% / 0.45)';
	const width = context.measureText(name).width + 14;
	context.beginPath();
	context.roundRect(point.x - width / 2, point.y + 14, width, 20, 6);
	context.fill();
	context.fillStyle = isSelected ? BankPalette.PegSelected : BankPalette.Label;
	context.fillText(name, point.x, point.y + 28);
	context.restore();
}
