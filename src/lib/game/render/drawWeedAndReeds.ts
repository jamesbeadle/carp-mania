import { isReedLine, type LakeLayout, type LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { scenePathOf, toScene, type Point } from '../scene/lakeShape';
import { BankPalette } from '../scene/palette';
import { weedColour } from '../scene/waterPalette';
import { pointsAlongPolyline } from './alongPolyline';
import { areaFeaturesOfKind } from './layoutShapes';
import { countForArea, scatterWithin, sceneBoundsOf } from './scatter';

const ScatterField = { Left: 120, Top: 90, Width: 720, Height: 460, StrideAcross: 173, StrideDown: 131, PatchesAtFullWeed: 26 } as const;
const WeedPatch = { SmallestRadius: 18, SizeSteps: 4, RadiusStep: 8, Alpha: 0.55 } as const;
const WeedBed = { FloorAlpha: 0.3, FrondRadius: 16, PixelsPerFrond: 900, MaximumFronds: 40 } as const;
const Reed = { Spacing: 9, Stalks: [{ offset: -4, height: 26 }, { offset: 0, height: 34 }, { offset: 4, height: 29 }], TipHeight: 7 } as const;

export function drawWeedBeds(context: CanvasRenderingContext2D, lake: Path2D, layout: LakeLayout, weed: number, timeSeconds: number) {
	context.save();
	context.clip(lake);
	drawScatteredWeed(context, weed, timeSeconds);
	for (const bed of areaFeaturesOfKind(layout, 'weed_bed')) drawWeedBed(context, bed.points, timeSeconds);
	context.restore();
}

function drawScatteredWeed(context: CanvasRenderingContext2D, weed: number, timeSeconds: number) {
	const patchCount = Math.round((weed / 100) * ScatterField.PatchesAtFullWeed);
	for (let index = 0; index < patchCount; index++) {
		const point = { x: ScatterField.Left + ((index * ScatterField.StrideAcross) % ScatterField.Width), y: ScatterField.Top + ((index * ScatterField.StrideDown) % ScatterField.Height) };
		drawWeedPatch(context, point, WeedPatch.SmallestRadius + (index % WeedPatch.SizeSteps) * WeedPatch.RadiusStep, timeSeconds + index);
	}
}

function drawWeedBed(context: CanvasRenderingContext2D, points: LayoutPoint[], timeSeconds: number) {
	const bed = scenePathOf(points);
	const bounds = sceneBoundsOf(points);
	context.save();
	context.clip(bed);
	context.fillStyle = weedColour(WeedBed.FloorAlpha);
	context.fill(bed);
	scatterWithin(bounds, countForArea(bounds, WeedBed.PixelsPerFrond, WeedBed.MaximumFronds)).forEach((frond, index) => drawWeedPatch(context, frond, WeedBed.FrondRadius, timeSeconds + index));
	context.restore();
}

function drawWeedPatch(context: CanvasRenderingContext2D, centre: Point, radius: number, phase: number) {
	context.fillStyle = weedColour(WeedPatch.Alpha);
	for (let frond = 0; frond < 6; frond++) {
		const angle = (frond / 6) * Math.PI * 2 + Math.sin(phase * 0.5) * 0.1;
		context.beginPath();
		context.ellipse(centre.x + Math.cos(angle) * radius * 0.4, centre.y + Math.sin(angle) * radius * 0.4, radius * 0.5, radius * 0.22, angle, 0, Math.PI * 2);
		context.fill();
	}
}

export function drawReeds(context: CanvasRenderingContext2D, layout: LakeLayout, timeSeconds: number) {
	context.save();
	context.lineWidth = 2;
	for (const line of layout.features.filter(isReedLine)) {
		pointsAlongPolyline(line.points.map(toScene), Reed.Spacing).forEach((root, index) => drawReedTuft(context, root, timeSeconds, index));
	}
	context.restore();
}

function drawReedTuft(context: CanvasRenderingContext2D, root: Point, timeSeconds: number, index: number) {
	Reed.Stalks.forEach((stalk, stalkIndex) => {
		const x = root.x + stalk.offset + Math.sin(index + stalkIndex) * 2;
		const sway = Math.sin(timeSeconds * 1.4 + index + stalkIndex) * 3;
		context.strokeStyle = BankPalette.Reed;
		context.beginPath();
		context.moveTo(x, root.y);
		context.quadraticCurveTo(x + sway, root.y - stalk.height / 2, x + sway * 1.6, root.y - stalk.height);
		context.stroke();
		context.fillStyle = BankPalette.ReedTip;
		context.fillRect(x + sway * 1.6 - 1.5, root.y - stalk.height - Reed.TipHeight + 1, 3, Reed.TipHeight);
	});
}
