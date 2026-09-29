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

const Lobes = { Fewest: 5, Extra: 4, Smallest: 0.055, RadiusRange: 0.15, Spread: 0.62, Margin: 0.03, Reach: 1.3 } as const;
const Leaves = { PerLobeArea: 2600, Shortest: 0.058, LengthRange: 0.04, Scatter: 1.1, Falloff: 0.8, Room: 0.1 } as const;

interface LeafShape {
	scale: number;
	width: number;
}

const Shapes = { Broad: { scale: 1, width: 0.56 }, FineBroad: { scale: 0.45, width: 0.56 }, Round: { scale: 0.9, width: 0.85 }, FineRound: { scale: 0.42, width: 0.85 } } as const;
const Light = { Darkest: 0.36, Range: 0.72, Height: 0.2, Order: 0.5, Lobe: 0.26, LobeUp: 0.75, LobeSide: 0.35, Warmth: 0.7, Cool: 0.28 } as const;
const Stem = { Width: 0.009, Base: 0.9, BaseSpread: 0.4, Bend: 0.25, Tone: { lightness: 0.3, warmth: 1 } } as const;
const FullTurn = Math.PI * 2;
const Sprays = { Fewest: 1, Extra: 3, Leaves: 7, Reach: 0.14, Jitter: 0.3, Splay: 0.8, Shrink: 0.8 } as const;

function lobeIn(region: PixelRegion, random: RandomFraction): Lobe {
	const size = region.width;
	const radius = (Lobes.Smallest + random() * Lobes.RadiusRange) * size;
	const room = size / 2 - radius * Lobes.Reach - (Lobes.Margin + Leaves.Room) * size;
	const clamp = (offset: number) => Math.max(-room, Math.min(room, offset));
	return { x: region.left + size / 2 + clamp(centredRandom(random) * Lobes.Spread * size), y: region.top + size / 2 + clamp(centredRandom(random) * Lobes.Spread * size), radius };
}

function lobeLightAt(lobe: Lobe, x: number, y: number) {
	const facing = ((lobe.y - y) * Light.LobeUp + (x - lobe.x) * Light.LobeSide) / (lobe.radius * Lobes.Reach);
	return Math.min(1, Math.max(0, (1 + facing) / 2));
}

function leafInLobe(lobe: Lobe, region: PixelRegion, shape: LeafShape, random: RandomFraction): PaintedLeaf {
	const heading = random() * FullTurn;
	const distance = Math.pow(random(), Leaves.Falloff) * lobe.radius * Lobes.Reach;
	const x = lobe.x + Math.cos(heading) * distance;
	const y = lobe.y + Math.sin(heading) * distance;
	const height = 1 - (y - region.top) / region.height;
	const length = (Leaves.Shortest + random() * Leaves.LengthRange) * region.width * shape.scale;
	const light = random() * Light.Order + height * Light.Height + lobeLightAt(lobe, x, y) * Light.Lobe;
	return { x, y, angle: heading + centredRandom(random) * Leaves.Scatter * 2, length, light };
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

function sprayFrom(lobe: Lobe, region: PixelRegion, shape: LeafShape, random: RandomFraction): PaintedLeaf[] {
	const heading = random() * FullTurn;
	const room = region.width / 2 - (Lobes.Margin + Leaves.Room) * region.width;
	const reach = Math.min(lobe.radius * Lobes.Reach + Sprays.Reach * region.width, room);
	const centre = { x: region.left + region.width / 2, y: region.top + region.height / 2 };
	return Array.from({ length: Sprays.Leaves }, (_, index) => {
		const distance = reach * ((index + 1) / Sprays.Leaves) * (1 + centredRandom(random) * Sprays.Jitter);
		const x = Math.max(centre.x - room, Math.min(centre.x + room, lobe.x + Math.cos(heading) * distance));
		const y = Math.max(centre.y - room, Math.min(centre.y + room, lobe.y + Math.sin(heading) * distance));
		const length = (Leaves.Shortest + random() * Leaves.LengthRange) * region.width * shape.scale * Sprays.Shrink;
		return { x, y, angle: heading + (index % 2 === 0 ? Sprays.Splay : -Sprays.Splay) + centredRandom(random), length, light: random() * Light.Order + Light.Height };
	});
}

function paintLeafMass(painter: AtlasPainter, region: PixelRegion, random: RandomFraction, shape: LeafShape) {
	const lobes = Array.from({ length: Lobes.Fewest + Math.floor(random() * Lobes.Extra) }, () => lobeIn(region, random));
	paintStems(painter, region, lobes, random);
	const leaves = lobes.flatMap((lobe) => {
		const count = Math.round(((lobe.radius / region.width / shape.scale) ** 2) * Leaves.PerLobeArea);
		return Array.from({ length: count }, () => leafInLobe(lobe, region, shape, random));
	});
	const sprays = Sprays.Fewest + Math.floor(random() * Sprays.Extra);
	for (let spray = 0; spray < sprays; spray++) leaves.push(...sprayFrom(lobes[spray % lobes.length], region, shape, random));
	leaves.sort((first, second) => first.light - second.light);
	leaves.forEach((leaf) => painter.leaf(leaf.x, leaf.y, leaf.angle, leaf.length, leaf.length * shape.width, toneOf(leaf, random)));
}

export const paintBroadleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.Broad);
export const paintFineBroadleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.FineBroad);
export const paintRoundleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.Round);
export const paintFineRoundleaf = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintLeafMass(painter, region, random, Shapes.FineRound);
