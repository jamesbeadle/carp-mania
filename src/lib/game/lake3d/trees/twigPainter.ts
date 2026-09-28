import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';
import { centredRandom } from './centredRandom';

const Twigs = { Depth: 8, FirstLength: 0.16, Shortening: 0.8, LengthJitter: 0.35, Spread: 0.36, Thickest: 0.014, Thinning: 0.7, Children: 2, ExtraChild: 0.45, Root: 0.97, Wobble: 0.5 } as const;
const Bark = { Darkest: 0.42, Range: 0.3, Warmth: -0.15, Coverage: 0.9 } as const;
const Whips = { Count: 11, Margin: 0.08, Jitter: 0.7, LateStart: 0.25, Sway: 0.05, Waves: 1.5, Steps: 16, Width: 0.012, Darkest: 0.45, Range: 0.25, Warmth: 0.2 } as const;
const Haze = { Blobs: 9, Height: 0.4, Rise: 0.25, Across: 0.3, Radius: 0.12, RadiusRange: 0.06, Coverage: 0.07, Tone: { lightness: 0.55, warmth: -0.15 } } as const;

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
	painter.stroke([[twig.x, twig.y], middle, end], twig.width, { lightness: Bark.Darkest + random() * Bark.Range, warmth: Bark.Warmth }, Bark.Coverage);
	if (twig.depth >= Twigs.Depth) return;
	const children = Twigs.Children + (random() < Twigs.ExtraChild ? 1 : 0);
	for (let child = 0; child < children; child++) {
		const fan = (child / Math.max(1, children - 1) - 1 / 2) * Twigs.Spread * 2;
		const heading = twig.heading + bend + fan + centredRandom(random) * Twigs.Spread;
		const length = twig.length * Twigs.Shortening * (1 + centredRandom(random) * Twigs.LengthJitter);
		growTwig(painter, { x: end[0], y: end[1], heading, length, width: Math.max(1, twig.width * Twigs.Thinning), depth: twig.depth + 1 }, random);
	}
}

function paintHaze(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const size = region.width;
	for (let blob = 0; blob < Haze.Blobs; blob++) {
		const x = region.left + size * (1 / 2 + centredRandom(random) * Haze.Across * 2);
		const y = region.top + size * (Haze.Height + centredRandom(random) * Haze.Rise);
		painter.haze(x, y, size * (Haze.Radius + random() * Haze.RadiusRange), Haze.Tone, Haze.Coverage);
	}
}

export function paintTwigs(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const size = region.width;
	paintHaze(painter, region, random);
	const root = { x: region.left + size / 2, y: region.top + size * Twigs.Root };
	growTwig(painter, { ...root, heading: -Math.PI / 2, length: Twigs.FirstLength * size, width: Twigs.Thickest * size, depth: 1 }, random);
}

export function paintWhips(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const { width, height } = region;
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
