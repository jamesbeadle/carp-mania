import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';

const Twigs = { Depth: 8, FirstLength: 0.19, Shortening: 0.8, LengthJitter: 0.4, Spread: 0.42, Thickest: 0.01, Thinning: 0.74, Children: 2, ExtraChild: 0.35, Root: 0.98 } as const;
const Bark = { Darkest: 0.55, Range: 0.3, Warmth: 0.15 } as const;

interface Twig {
	x: number;
	y: number;
	heading: number;
	length: number;
	width: number;
	depth: number;
}

function growTwig(painter: AtlasPainter, twig: Twig, random: RandomFraction) {
	const bend = ((random() - 1 / 2) * Twigs.Spread) / 2;
	const half = twig.length / 2;
	const middle: [number, number] = [twig.x + Math.cos(twig.heading) * half, twig.y + Math.sin(twig.heading) * half];
	const end: [number, number] = [middle[0] + Math.cos(twig.heading + bend) * half, middle[1] + Math.sin(twig.heading + bend) * half];
	painter.stroke([[twig.x, twig.y], middle, end], twig.width, { lightness: Bark.Darkest + random() * Bark.Range, warmth: Bark.Warmth });
	if (twig.depth >= Twigs.Depth) return;
	const children = Twigs.Children + (random() < Twigs.ExtraChild ? 1 : 0);
	for (let child = 0; child < children; child++) {
		const heading = twig.heading + bend + (child / Math.max(1, children - 1) - 1 / 2) * Twigs.Spread * 2 + (random() - 1 / 2) * Twigs.Spread;
		growTwig(painter, { x: end[0], y: end[1], heading, length: twig.length * Twigs.Shortening * (1 + (random() - 1 / 2) * Twigs.LengthJitter), width: Math.max(1, twig.width * Twigs.Thinning), depth: twig.depth + 1 }, random);
	}
}

export function paintTwigs(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const size = region.width;
	const root = { x: region.left + size / 2, y: region.top + size * Twigs.Root };
	growTwig(painter, { ...root, heading: -Math.PI / 2, length: Twigs.FirstLength * size, width: Twigs.Thickest * size, depth: 1 }, random);
}
