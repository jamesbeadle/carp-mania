import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion, Tone } from './atlasPainter';
import { centredRandom } from './centredRandom';

interface Lobe {
	x: number;
	y: number;
	radius: number;
}

interface PaintedLeaf {
	x: number;
	y: number;
	angle: number;
	length: number;
	light: number;
}

const Lobes = { Fewest: 3, Extra: 3, Smallest: 0.15, RadiusRange: 0.1, Spread: 0.6, Margin: 0.03 } as const;
const Leaves = { PerLobeArea: 1900, Shortest: 0.058, LengthRange: 0.04, Scatter: 1.1, EdgeBias: 0.65, Room: 0.1 } as const;

interface LeafShape {
	scale: number;
	width: number;
}

const Shapes = { Broad: { scale: 1, width: 0.56 }, FineBroad: { scale: 0.45, width: 0.56 }, Round: { scale: 0.9, width: 0.85 }, FineRound: { scale: 0.42, width: 0.85 } } as const;
const Light = { Darkest: 0.42, Range: 0.62, Height: 0.35, Order: 0.65, Warmth: 0.7, Cool: 0.28 } as const;
const Stem = { Width: 0.009, Base: 0.9, BaseSpread: 0.4, Bend: 0.25, Tone: { lightness: 0.3, warmth: 1 } } as const;
const FullTurn = Math.PI * 2;

function lobeIn(region: PixelRegion, random: RandomFraction): Lobe {
	const size = region.width;
	const radius = (Lobes.Smallest + random() * Lobes.RadiusRange) * size;
	const room = size / 2 - radius - (Lobes.Margin + Leaves.Room) * size;
	const clamp = (offset: number) => Math.max(-room, Math.min(room, offset));
	return { x: region.left + size / 2 + clamp(centredRandom(random) * Lobes.Spread * size), y: region.top + size / 2 + clamp(centredRandom(random) * Lobes.Spread * size), radius };
}

function leafInLobe(lobe: Lobe, region: PixelRegion, shape: LeafShape, random: RandomFraction): PaintedLeaf {
	const heading = random() * FullTurn;
	const distance = Math.pow(random(), 1 - Leaves.EdgeBias / 2) * lobe.radius;
	const y = lobe.y + Math.sin(heading) * distance;
	const height = 1 - (y - region.top) / region.height;
	const length = (Leaves.Shortest + random() * Leaves.LengthRange) * region.width * shape.scale;
	return { x: lobe.x + Math.cos(heading) * distance, y, angle: heading + centredRandom(random) * Leaves.Scatter * 2, length, light: random() * Light.Order + height * Light.Height };
}

function toneOf(leaf: PaintedLeaf, random: RandomFraction): Tone {
	return { lightness: Light.Darkest + Light.Range * leaf.light, warmth: random() * Light.Warmth - Light.Cool };
}

function paintStems(painter: AtlasPainter, region: PixelRegion, lobes: Lobe[], random: RandomFraction) {
	const size = region.width;
	const base: [number, number] = [region.left + size * (1 / 2 + centredRandom(random) * Stem.BaseSpread), region.top + size * Stem.Base];
	lobes.forEach((lobe) => {
		const middle: [number, number] = [(base[0] + lobe.x) / 2 + centredRandom(random) * Stem.Bend * size, (base[1] + lobe.y) / 2];
		painter.stroke([base, middle, [lobe.x, lobe.y]], Stem.Width * size, Stem.Tone);
	});
}

function paintLeafMass(painter: AtlasPainter, region: PixelRegion, random: RandomFraction, shape: LeafShape) {
	const lobes = Array.from({ length: Lobes.Fewest + Math.floor(random() * Lobes.Extra) }, () => lobeIn(region, random));
	paintStems(painter, region, lobes, random);
	const leaves = lobes.flatMap((lobe) => {
		const count = Math.round(((lobe.radius / region.width / shape.scale) ** 2) * Leaves.PerLobeArea);
		return Array.from({ length: count }, () => leafInLobe(lobe, region, shape, random));
	});
	leaves.sort((first, second) => first.light - second.light);
	leaves.forEach((leaf) => painter.leaf(leaf.x, leaf.y, leaf.angle, leaf.length, leaf.length * shape.width, toneOf(leaf, random)));
}

export const paintBroadleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.Broad);
export const paintFineBroadleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.FineBroad);
export const paintRoundleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.Round);
export const paintFineRoundleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.FineRound);
