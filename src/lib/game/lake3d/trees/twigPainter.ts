import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';
import { centredRandom } from './centredRandom';

const Twigs = { Depth: 7, FirstLength: 0.2, Shortening: 0.78, LengthJitter: 0.35, Spread: 0.42, Thickest: 0.016, Thinning: 0.68, Children: 2, ExtraChild: 0.3, Root: 0.97, Wobble: 0.45 } as const;
const Bark = { Darkest: 0.34, Range: 0.2, Warmth: 0.05, Coverage: 1, TipCoverage: 0.45 } as const;
const Whips = { Count: 7, Margin: 0.08, Jitter: 0.7, LateStart: 0.25, Sway: 0.05, Waves: 1.5, Steps: 16, Width: 0.012, Darkest: 0.45, Range: 0.25, Warmth: 0.2 } as const;

interface Twig {
	x: number;
	y: number;
	heading: number;
	length: number;
	width: number;
	depth: number;
}

function growTwig(painter: AtlasPainter, twig: Twig, random: RandomFraction) {
	const bend = centredRandom(random) * Twigs.Wobble;
	const half = twig.length / 2;
	const middle: [number, number] = [twig.x + Math.cos(twig.heading) * half, twig.y + Math.sin(twig.heading) * half];
	const end: [number, number] = [middle[0] + Math.cos(twig.heading + bend) * half, middle[1] + Math.sin(twig.heading + bend) * half];
	const coverage = Bark.Coverage + ((Bark.TipCoverage - Bark.Coverage) * (twig.depth - 1)) / (Twigs.Depth - 1);
	painter.stroke([[twig.x, twig.y], middle, end], twig.width, { lightness: Bark.Darkest + random() * Bark.Range, warmth: Bark.Warmth }, coverage);
	if (twig.depth >= Twigs.Depth) return;
	const children = Twigs.Children + (random() < Twigs.ExtraChild ? 1 : 0);
	for (let child = 0; child < children; child++) {
		const fan = (child / Math.max(1, children - 1) - 1 / 2) * Twigs.Spread * 2;
		const heading = twig.heading + bend + fan + centredRandom(random) * Twigs.Spread;
		const length = twig.length * Twigs.Shortening * (1 + centredRandom(random) * Twigs.LengthJitter);
		growTwig(painter, { x: end[0], y: end[1], heading, length, width: Math.max(1, twig.width * Twigs.Thinning), depth: twig.depth + 1 }, random);
	}
}

export function paintTwigs(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const size = region.width;
	painter.backdrop(region, { lightness: Bark.Darkest + Bark.Range / 2, warmth: Bark.Warmth });
	const root = { x: region.left + size / 2, y: region.top + size * Twigs.Root };
	growTwig(painter, { ...root, heading: -Math.PI / 2, length: Twigs.FirstLength * size, width: Twigs.Thickest * size, depth: 1 }, random);
}

export function paintWhips(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const { width, height } = region;
	painter.backdrop(region, { lightness: Whips.Darkest + Whips.Range / 2, warmth: Whips.Warmth });
	for (let whip = 0; whip < Whips.Count; whip++) {
		const x = region.left + width * (Whips.Margin + ((1 - Whips.Margin * 2) * (whip + random() * Whips.Jitter)) / Whips.Count);
		const start = height * random() * Whips.LateStart;
		const phase = random() * Math.PI * 2;
		const points = Array.from({ length: Whips.Steps + 1 }, (_, step): [number, number] => {
			const y = start + ((height - start) * step) / Whips.Steps;
			return [x + Math.sin(phase + (y / height) * Math.PI * Whips.Waves) * Whips.Sway * width, region.top + y];
		});
		painter.stroke(points, Whips.Width * width, { lightness: Whips.Darkest + random() * Whips.Range, warmth: Whips.Warmth });
	}
}
