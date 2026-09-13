import type { Point } from '../scene/lakeShape';
import { BankPalette, SceneSize } from '../scene/palette';

const LabelFont = { Size: 13, Family: 'Inter, system-ui, sans-serif', EmphasisWeight: '600 ' } as const;
const LabelPill = { Padding: 14, Height: 20, Radius: 6, DropBelowAnchor: 14, BaselineInPill: 14, Margin: 2 } as const;

export function drawCanvasLabel(context: CanvasRenderingContext2D, anchor: Point, text: string, colour: string, isEmphasised: boolean) {
	context.save();
	context.font = `${isEmphasised ? LabelFont.EmphasisWeight : ''}${LabelFont.Size}px ${LabelFont.Family}`;
	context.textAlign = 'center';
	const width = context.measureText(text).width + LabelPill.Padding;
	const left = keptOnTheScene(anchor.x - width / 2, width, SceneSize.Width);
	const top = keptOnTheScene(anchor.y + LabelPill.DropBelowAnchor, LabelPill.Height, SceneSize.Height);
	context.fillStyle = BankPalette.LabelBackdrop;
	context.beginPath();
	context.roundRect(left, top, width, LabelPill.Height, LabelPill.Radius);
	context.fill();
	context.fillStyle = colour;
	context.fillText(text, left + width / 2, top + LabelPill.BaselineInPill);
	context.restore();
}

export function labelAnchorBehind(point: Point, facing: number, distance: number): Point {
	return { x: point.x - Math.cos(facing) * distance, y: point.y - Math.sin(facing) * distance - LabelPill.DropBelowAnchor - LabelPill.Height / 2 };
}

function keptOnTheScene(start: number, size: number, sceneSize: number) {
	return Math.min(Math.max(start, LabelPill.Margin), sceneSize - size - LabelPill.Margin);
}
