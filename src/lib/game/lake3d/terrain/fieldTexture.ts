import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { FieldTile, type Field, type FieldPattern, type HedgeLine } from './fieldPattern';

const Pixels = 1024;
const PixelsPerMetre = Pixels / FieldTile.Metres;
const Anisotropy = 8;
const Crops: Record<SeasonName, string[]> = {
	spring: ['#5a8431', '#7a9c45', '#c7bf4a', '#6a5638'],
	summer: ['#587a30', '#7d8a3e', '#bba75a', '#a19a58'],
	autumn: ['#62763a', '#6f8040', '#b3a06a', '#5b4832'],
	winter: ['#5c6a48', '#6a784a', '#877b58', '#4d3f2f']
};
const Hedge = { Colour: '#2f4420', Width: 3.2, Headland: '#7c8a4c', HeadlandWidth: 7 } as const;
const Rows = { EveryPixels: 5, Shade: 0.07, FirstCrop: 2 } as const;
const Speckle = { PerField: 260, Shade: 0.05 } as const;

function shadeOf(hex: string, change: number) {
	return `#${new Color(hex).offsetHSL(0, 0, change).getHexString()}`;
}

function paintField(context: CanvasRenderingContext2D, field: Field, palette: string[], random: () => number) {
	const { least, most } = field;
	const [x, y, width, height] = [least.x * PixelsPerMetre, least.z * PixelsPerMetre, (most.x - least.x) * PixelsPerMetre, (most.z - least.z) * PixelsPerMetre];
	const base = shadeOf(palette[field.crop], (random() - 0.5) * 0.06);
	context.fillStyle = base;
	context.fillRect(x, y, width, height);
	const isSown = field.crop >= Rows.FirstCrop;
	context.fillStyle = shadeOf(base, isSown ? Rows.Shade : Speckle.Shade);
	for (let row = 0; isSown && row < height; row += Rows.EveryPixels) context.fillRect(x, y + row, width, 1);
	for (let speck = 0; speck < Speckle.PerField; speck++) context.fillRect(x + random() * width, y + random() * height, 2, 2);
}

const WrappedCopies = [[0, 0], [Pixels, 0], [0, Pixels]];

function strokeLine(context: CanvasRenderingContext2D, line: HedgeLine) {
	const { from, to } = line;
	WrappedCopies.forEach(([across, down]) => {
		context.beginPath();
		context.moveTo(from.x * PixelsPerMetre + across, from.z * PixelsPerMetre + down);
		context.lineTo(to.x * PixelsPerMetre + across, to.z * PixelsPerMetre + down);
		context.stroke();
	});
}

function strokeHedges(context: CanvasRenderingContext2D, hedges: HedgeLine[], colour: string, width: number) {
	context.strokeStyle = colour;
	context.lineWidth = width;
	hedges.forEach((line) => strokeLine(context, line));
}

export function fieldTexture(pattern: FieldPattern, season: SeasonName, seed: number) {
	const canvas = document.createElement('canvas');
	canvas.width = Pixels;
	canvas.height = Pixels;
	const context = canvas.getContext('2d');
	const random = seededRandom(seed);
	if (context) {
		pattern.fields.forEach((field) => paintField(context, field, Crops[season], random));
		strokeHedges(context, pattern.hedges, Hedge.Headland, Hedge.HeadlandWidth);
		strokeHedges(context, pattern.hedges, Hedge.Colour, Hedge.Width);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.flipY = false;
	texture.anisotropy = Anisotropy;
	return texture;
}
