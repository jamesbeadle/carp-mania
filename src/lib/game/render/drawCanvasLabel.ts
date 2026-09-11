import type { Point } from '../scene/lakeShape';
import { BankPalette } from '../scene/palette';

const LabelFont = { Size: 13, Family: 'Inter, system-ui, sans-serif', EmphasisWeight: '600 ' } as const;
const LabelPill = { Padding: 14, Height: 20, Radius: 6, DropBelowAnchor: 14, BaselineBelowAnchor: 28 } as const;

export function drawCanvasLabel(context: CanvasRenderingContext2D, anchor: Point, text: string, colour: string, isEmphasised: boolean) {
	context.save();
	context.font = `${isEmphasised ? LabelFont.EmphasisWeight : ''}${LabelFont.Size}px ${LabelFont.Family}`;
	context.textAlign = 'center';
	context.fillStyle = BankPalette.LabelBackdrop;
	const width = context.measureText(text).width + LabelPill.Padding;
	context.beginPath();
	context.roundRect(anchor.x - width / 2, anchor.y + LabelPill.DropBelowAnchor, width, LabelPill.Height, LabelPill.Radius);
	context.fill();
	context.fillStyle = colour;
	context.fillText(text, anchor.x, anchor.y + LabelPill.BaselineBelowAnchor);
	context.restore();
}
