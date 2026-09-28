import { seededRandom } from '$lib/domain/random';
import { aroundTheSeams, fillFromNoise, paintedTile, shadeOf } from './canvasTile';
import type { GrassPalette } from './groundPalette';
import { tileableNoise } from './tileNoise';

const Blades = { PerPixel: 0.26, ShortestPixels: 1.6, LongestPixels: 5.5, WidthPixels: 1.15, TipShare: 0.5, TipWidthShare: 0.6, LaySpread: 1.3, LayTurns: 3, Seed: 71 } as const;
const BladeWeights = [0.26, 0.32, 0.22, 0.12, 0.05, 0.03];
const Shades = { Base: [0.68, 0.8], Tip: [1.05, 1.22] } as const;
const ReferencePixels = 512;
const Ground = { Cells: 8, Octaves: 4, Seed: 5 } as const;
const Lay = { cells: 4, octaves: 2, seed: 9 } as const;

interface Bundle {
	tone: string;
	lightness: number;
	base: Path2D;
	tip: Path2D;
}

function pickWeighted(random: () => number) {
	let roll = random();
	const index = BladeWeights.findIndex((weight) => (roll -= weight) < 0);
	return index < 0 ? BladeWeights.length - 1 : index;
}

function bundlesFor(palette: GrassPalette): Bundle[] {
	return palette.blades.flatMap((tone) => [0, 1].map((lightness) => ({ tone, lightness, base: new Path2D(), tip: new Path2D() })));
}

function gatherBlades(pixels: number, bundles: Bundle[]) {
	const random = seededRandom(Blades.Seed);
	const lay = tileableNoise({ pixels, ...Lay });
	const scale = pixels / ReferencePixels;
	const count = Math.round(pixels * pixels * Blades.PerPixel);
	for (let index = 0; index < count; index++) {
		const x = random() * pixels;
		const y = random() * pixels;
		const length = (Blades.ShortestPixels + random() * (Blades.LongestPixels - Blades.ShortestPixels)) * scale;
		const angle = lay[Math.floor(y) * pixels + Math.floor(x)] * Math.PI * Blades.LayTurns + (random() - 0.5) * Blades.LaySpread;
		const bundle = bundles[pickWeighted(random) * 2 + (random() < 0.5 ? 0 : 1)];
		const reachX = Math.cos(angle) * length;
		const reachY = Math.sin(angle) * length;
		aroundTheSeams(pixels, x, y, length, (startX, startY) => {
			bundle.base.moveTo(startX, startY);
			bundle.base.lineTo(startX + reachX * Blades.TipShare, startY + reachY * Blades.TipShare);
			bundle.tip.moveTo(startX + reachX * Blades.TipShare * Blades.TipShare, startY + reachY * Blades.TipShare * Blades.TipShare);
			bundle.tip.lineTo(startX + reachX, startY + reachY);
		});
	}
}

function strokeBundles(context: CanvasRenderingContext2D, pixels: number, bundles: Bundle[]) {
	const width = Blades.WidthPixels * (pixels / ReferencePixels);
	context.lineCap = 'round';
	bundles.forEach(({ tone, lightness, base }) => {
		context.strokeStyle = shadeOf(tone, Shades.Base[lightness]);
		context.lineWidth = width;
		context.stroke(base);
	});
	bundles.forEach(({ tone, lightness, tip }) => {
		context.strokeStyle = shadeOf(tone, Shades.Tip[lightness]);
		context.lineWidth = width * Blades.TipWidthShare;
		context.stroke(tip);
	});
}

export function grassTile(pixels: number, palette: GrassPalette) {
	return paintedTile(pixels, (context) => {
		const noise = tileableNoise({ pixels, cells: Ground.Cells, octaves: Ground.Octaves, seed: Ground.Seed });
		fillFromNoise(context, pixels, noise, palette.soil, palette.blades[0]);
		const bundles = bundlesFor(palette);
		gatherBlades(pixels, bundles);
		strokeBundles(context, pixels, bundles);
	});
}
