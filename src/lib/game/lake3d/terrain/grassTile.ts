import { seededRandom } from '$lib/domain/random';
import { aroundTheSeams, fillFromNoise, paintedTile, shadeOf } from './canvasTile';
import type { GrassPalette } from './groundPalette';
import { tileableNoise } from './tileNoise';

const Blades = { PerPixel: 0.22, ShortestPixels: 2, LongestPixels: 7, ThinnestPixels: 0.6, WidthSpread: 0.7, Seed: 71 } as const;
const BladeWeights = [0.3, 0.34, 0.2, 0.1, 0.04, 0.02];
const ReferencePixels = 512;
const Lightness = { Least: 0.85, Spread: 0.3 } as const;
const Ground = { Cells: 8, Octaves: 4, Seed: 5 } as const;

function pickWeighted(random: () => number) {
	let roll = random();
	const index = BladeWeights.findIndex((weight) => (roll -= weight) < 0);
	return index < 0 ? BladeWeights.length - 1 : index;
}

function paintBlades(context: CanvasRenderingContext2D, pixels: number, palette: GrassPalette) {
	const random = seededRandom(Blades.Seed);
	const scale = pixels / ReferencePixels;
	const count = Math.round(pixels * pixels * Blades.PerPixel);
	context.lineCap = 'round';
	for (let index = 0; index < count; index++) {
		const length = (Blades.ShortestPixels + random() * (Blades.LongestPixels - Blades.ShortestPixels)) * scale;
		const angle = random() * Math.PI * 2;
		const tone = palette.blades[pickWeighted(random)];
		context.strokeStyle = shadeOf(tone, Lightness.Least + random() * Lightness.Spread);
		context.lineWidth = (Blades.ThinnestPixels + random() * Blades.WidthSpread) * scale;
		const reachX = Math.cos(angle) * length;
		const reachY = Math.sin(angle) * length;
		aroundTheSeams(pixels, random() * pixels, random() * pixels, length, (x, y) => {
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(x + reachX, y + reachY);
			context.stroke();
		});
	}
}

export function grassTile(pixels: number, palette: GrassPalette) {
	return paintedTile(pixels, (context) => {
		const noise = tileableNoise({ pixels, cells: Ground.Cells, octaves: Ground.Octaves, seed: Ground.Seed });
		fillFromNoise(context, pixels, noise, palette.soil, palette.blades[0]);
		paintBlades(context, pixels, palette);
	});
}
