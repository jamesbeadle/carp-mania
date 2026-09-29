import { seededRandom } from '$lib/domain/random';
import { aroundTheSeams, fillFromNoise, paintedTile, shadeOf } from './canvasTile';
import type { SoilPalette } from './groundPalette';
import { tileableNoise } from './tileNoise';

export interface Scatter {
	perPixel: number;
	smallestPixels: number;
	largestPixels: number;
	seed: number;
}

const ReferencePixels = 512;
const Base = { Cells: 10, Octaves: 5, Seed: 17 } as const;
const Pebble = { Squash: 0.45, ShadowShift: 0.22, ShadowShade: 0.45, ShineShift: -0.28, ShineShare: 0.55, ShineShade: 1.16, Least: 0.78, Spread: 0.34 } as const;

interface Stone {
	x: number;
	y: number;
	radius: number;
	squash: number;
	turn: number;
	tone: string;
}

function stonesOf(pixels: number, palette: SoilPalette, scatter: Scatter): Stone[] {
	const random = seededRandom(scatter.seed);
	const scale = pixels / ReferencePixels;
	const count = Math.round(pixels * pixels * scatter.perPixel);
	const { stones: tones } = palette;
	const stones = Array.from({ length: count }, () => {
		const radius = (scatter.smallestPixels + random() ** 2 * (scatter.largestPixels - scatter.smallestPixels)) * scale;
		const tone = shadeOf(tones[Math.floor(random() * tones.length)], Pebble.Least + random() * Pebble.Spread);
		return { x: random() * pixels, y: random() * pixels, radius, squash: 1 - random() * Pebble.Squash, turn: random() * Math.PI, tone };
	});
	return stones.sort((first, second) => second.radius - first.radius);
}

function oval(context: CanvasRenderingContext2D, x: number, y: number, stone: Stone, grow: number) {
	context.beginPath();
	context.ellipse(x, y, stone.radius * grow, stone.radius * stone.squash * grow, stone.turn, 0, Math.PI * 2);
	context.fill();
}

function paintStone(context: CanvasRenderingContext2D, stone: Stone, pixels: number) {
	aroundTheSeams(pixels, stone.x, stone.y, stone.radius * 2, (x, y) => {
		const shift = stone.radius;
		context.fillStyle = `rgba(20, 16, 10, ${Pebble.ShadowShade})`;
		oval(context, x + shift * Pebble.ShadowShift, y + shift * Pebble.ShadowShift, stone, 1.05);
		context.fillStyle = stone.tone;
		oval(context, x, y, stone, 1);
		context.fillStyle = shadeOf(stone.tone, Pebble.ShineShade);
		oval(context, x + shift * Pebble.ShineShift, y + shift * Pebble.ShineShift, stone, Pebble.ShineShare);
	});
}

export function paintStones(context: CanvasRenderingContext2D, pixels: number, palette: SoilPalette, scatter: Scatter) {
	stonesOf(pixels, palette, scatter).forEach((stone) => paintStone(context, stone, pixels));
}

export function stoneTile(pixels: number, palette: SoilPalette, scatter: Scatter) {
	return paintedTile(pixels, (context) => {
		fillFromNoise(context, pixels, tileableNoise({ pixels, cells: Base.Cells, octaves: Base.Octaves, seed: Base.Seed }), palette.low, palette.high);
		paintStones(context, pixels, palette, scatter);
	});
}
