import { seededRandom } from '$lib/domain/random';
import { aroundTheSeams, fillFromNoise, paintedTile } from './canvasTile';
import type { SoilPalette } from './groundPalette';
import { paintStones } from './stoneTile';
import { tileableNoise } from './tileNoise';

const ReferencePixels = 512;
const Base = { Cells: 6, Octaves: 6, Seed: 23 } as const;
const Grit = { PerPixel: 1 / 700, SmallestPixels: 1.5, LargestPixels: 6, Seed: 31 } as const;
const Roots = { Count: 26, LongestPixels: 90, WidthPixels: 1.4, Seed: 43, Shade: 0.7 } as const;
const Litter = { Count: 140, LargestPixels: 5, Seed: 59, Shade: 0.8 } as const;

function paintRoots(context: CanvasRenderingContext2D, pixels: number, palette: SoilPalette) {
	const random = seededRandom(Roots.Seed);
	const scale = pixels / ReferencePixels;
	context.strokeStyle = palette.litter;
	context.globalAlpha = Roots.Shade;
	for (let index = 0; index < Roots.Count; index++) {
		const length = random() * Roots.LongestPixels * scale;
		const bend = (random() - 0.5) * length;
		const angle = random() * Math.PI * 2;
		context.lineWidth = (0.5 + random()) * Roots.WidthPixels * scale;
		aroundTheSeams(pixels, random() * pixels, random() * pixels, length, (x, y) => {
			context.beginPath();
			context.moveTo(x, y);
			context.quadraticCurveTo(x + Math.cos(angle) * length * 0.5 - bend, y + Math.sin(angle) * length * 0.5 + bend, x + Math.cos(angle) * length, y + Math.sin(angle) * length);
			context.stroke();
		});
	}
	context.globalAlpha = 1;
}

function paintLitter(context: CanvasRenderingContext2D, pixels: number, palette: SoilPalette) {
	const random = seededRandom(Litter.Seed);
	const scale = pixels / ReferencePixels;
	context.fillStyle = palette.litter;
	context.globalAlpha = Litter.Shade;
	for (let index = 0; index < Litter.Count; index++) {
		const size = (1 + random() * Litter.LargestPixels) * scale;
		const turn = random() * Math.PI;
		aroundTheSeams(pixels, random() * pixels, random() * pixels, size, (x, y) => {
			context.beginPath();
			context.ellipse(x, y, size, size * 0.4, turn, 0, Math.PI * 2);
			context.fill();
		});
	}
	context.globalAlpha = 1;
}

export function soilTile(pixels: number, palette: SoilPalette) {
	return paintedTile(pixels, (context) => {
		fillFromNoise(context, pixels, tileableNoise({ pixels, cells: Base.Cells, octaves: Base.Octaves, seed: Base.Seed }), palette.low, palette.high);
		paintLitter(context, pixels, palette);
		paintRoots(context, pixels, palette);
		paintStones(context, pixels, palette, { perPixel: Grit.PerPixel, smallestPixels: Grit.SmallestPixels, largestPixels: Grit.LargestPixels, seed: Grit.Seed });
	});
}
