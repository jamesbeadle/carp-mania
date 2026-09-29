import { CanvasTexture, SRGBColorSpace } from 'three';
import { pickRandom, seededRandom, type RandomFraction } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { paintDot, shadeOf } from '../grass/bladeStroke';
import { ReedPalettes } from './reedPalette';

const Canopy = { Pixels: 128, Leaves: 900, Plumes: 110, Seed: 5153, Edge: 0.46, Ragged: 0.12 } as const;
const Speck = { Smallest: 1.2, Largest: 3.2, PlumeSmallest: 2, PlumeLargest: 4.5, Shadow: -0.42, ShadowShare: 0.62 } as const;
const Floor = { Shade: -0.5, Reach: 0.36 } as const;

function spotInDisc(random: RandomFraction) {
	const turn = random() * Math.PI * 2;
	const reach = Math.sqrt(random()) * (Canopy.Edge - random() * Canopy.Ragged);
	return { x: (1 / 2 + Math.cos(turn) * reach) * Canopy.Pixels, y: (1 / 2 + Math.sin(turn) * reach) * Canopy.Pixels };
}

function paintSpecks(context: CanvasRenderingContext2D, colours: string[], count: number, sizes: [number, number], random: RandomFraction) {
	for (let speck = 0; speck < count; speck++) {
		const base = pickRandom(random, colours);
		const colour = random() < Speck.ShadowShare ? shadeOf(base, Speck.Shadow) : base;
		paintDot(context, spotInDisc(random), sizes[0] + random() * (sizes[1] - sizes[0]), colour);
	}
}

export function reedCanopyTexture(season: SeasonName) {
	const canvas = document.createElement('canvas');
	canvas.width = Canopy.Pixels;
	canvas.height = Canopy.Pixels;
	const context = canvas.getContext('2d');
	const palette = ReedPalettes[season];
	const random = seededRandom(Canopy.Seed);
	if (context) {
		paintDot(context, { x: Canopy.Pixels / 2, y: Canopy.Pixels / 2 }, Canopy.Pixels * Floor.Reach, shadeOf(palette.leaves[0], Floor.Shade));
		paintSpecks(context, [...palette.leaves, ...palette.stems], Canopy.Leaves, [Speck.Smallest, Speck.Largest], random);
		paintSpecks(context, palette.plumes, Canopy.Plumes, [Speck.PlumeSmallest, Speck.PlumeLargest], random);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
