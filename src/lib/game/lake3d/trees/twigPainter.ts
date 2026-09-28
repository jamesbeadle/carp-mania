import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';

const Twigs = { Depth: 7, FirstLength: 0.2, Shortening: 0.78, Spread: 0.42, Thickest: 0.008, Thinning: 0.72, Children: 2, ExtraChild: 0.35 } as const;

interface Twig {
	x: number;
	y: number;
	heading: number;
	length: number;
	width: number;
	depth: number;
}

function growTwig(painter: AtlasPainter, twig: Twig, random: RandomFraction) {
	const bend = (random() - 0.5) * Twigs.Spread * 0.5;
	const middle: [number, number] = [twig.x + Math.cos(twig.heading) * twig.length * 0.5, twig.y + Math.sin(twig.heading) * twig.length * 0.5];
	const end: [number, number] = [middle[0] + Math.cos(twig.heading + bend) * twig.length * 0.5, middle[1] + Math.sin(twig.heading + bend) * twig.length * 0.5];
	painter.stroke([[twig.x, twig.y], middle, end], twig.width, { lightness: 0.55 + random() * 0.3, warmth: 0.6 });
	if (twig.depth >= Twigs.Depth) return;
	const children = Twigs.Children + (random() < Twigs.ExtraChild ? 1 : 0);
	for (let child = 0; child < children; child++) {
		const heading = twig.heading + bend + (child / Math.max(1, children - 1) - 0.5) * Twigs.Spread * 2 + (random() - 0.5) * Twigs.Spread;
		growTwig(painter, { x: end[0], y: end[1], heading, length: twig.length * Twigs.Shortening * (0.8 + random() * 0.4), width: Math.max(1, twig.width * Twigs.Thinning), depth: twig.depth + 1 }, random);
	}
}

export function paintTwigs(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const size = region.width;
	const root = { x: region.left + size / 2, y: region.top + size * 0.98 };
	growTwig(painter, { ...root, heading: -Math.PI / 2, length: Twigs.FirstLength * size, width: Twigs.Thickest * size, depth: 1 }, random);
}
