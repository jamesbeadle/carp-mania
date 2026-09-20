import { isSanctuary, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import { toScene } from '../scene/lakeShape';
import { BankPalette } from '../scene/palette';

const SanctuaryLine = { Width: 4, Dash: [10, 8] as number[], Alpha: 0.85, LabelOffset: 12, Font: 'bold 11px sans-serif' } as const;
const SanctuaryWords = 'Sanctuary';

export function drawSanctuaries(context: CanvasRenderingContext2D, layout: LakeLayout) {
	for (const stretch of layout.features.filter(isSanctuary)) {
		const points = stretch.points.map(toScene);
		if (points.length < 2) continue;
		context.save();
		context.globalAlpha = SanctuaryLine.Alpha;
		context.strokeStyle = BankPalette.SanctuaryLine;
		context.lineWidth = SanctuaryLine.Width;
		context.setLineDash(SanctuaryLine.Dash);
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (const { x, y } of points.slice(1)) context.lineTo(x, y);
		context.stroke();
		context.setLineDash([]);
		context.fillStyle = BankPalette.SanctuaryLine;
		context.font = SanctuaryLine.Font;
		context.fillText(SanctuaryWords, points[0].x + SanctuaryLine.LabelOffset, points[0].y - SanctuaryLine.LabelOffset);
		context.restore();
	}
}
