import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';
import { centredRandom } from './centredRandom';

type Point = [number, number];

const Sprays = { Fewest: 6, Extra: 3, TopFrom: 0.22, TopRange: 0.25, Across: 0.55, Rise: 0.25, RiseRange: 0.5, Steps: 20, Step: 0.04, Gravity: 0.2, Margin: 0.04 } as const;
const Leaflets = { From: 2, Shortest: 0.042, LengthRange: 0.026, Width: 0.66, Hang: 0.35, Splay: 0.9, Skip: 0.05, Darkest: 0.5, Range: 0.55, Warmth: 0.6, Cool: 0.22 } as const;
const Twig = { Width: 0.005, Tone: { lightness: 0.28, warmth: 0.8 } } as const;

interface SprayShape {
	leafScale: number;
	sprays: number;
	step: number;
}

const Shapes = { Near: { leafScale: 1, sprays: 1, step: 1 }, Fine: { leafScale: 0.55, sprays: 1.6, step: 0.6 } } as const;

function isInside(region: PixelRegion, [x, y]: Point) {
	const margin = Sprays.Margin * region.width;
	return x > region.left + margin && x < region.left + region.width - margin && y > region.top + margin && y < region.top + region.height - margin;
}

function sprayPath(region: PixelRegion, shape: SprayShape, random: RandomFraction) {
	const size = region.width;
	const side = random() < 1 / 2 ? -1 : 1;
	const start: Point = [region.left + size * (1 / 2 + centredRandom(random) * Sprays.Across), region.top + size * (Sprays.TopFrom + random() * Sprays.TopRange)];
	const direction = { x: side, y: -(Sprays.Rise + random() * Sprays.RiseRange) };
	const points: Point[] = [start];
	for (let step = 0; step < Sprays.Steps / shape.step; step++) {
		const length = Math.hypot(direction.x, direction.y);
		const [x, y] = points[points.length - 1];
		const stride = Sprays.Step * size * shape.step;
		const next: Point = [x + (direction.x / length) * stride, y + (direction.y / length) * stride];
		if (!isInside(region, next)) break;
		points.push(next);
		direction.y += Sprays.Gravity * shape.step * (1 + random());
	}
	return points;
}

function paintLeaflets(painter: AtlasPainter, region: PixelRegion, points: Point[], shape: SprayShape, random: RandomFraction) {
	points.slice(Leaflets.From).forEach(([x, y], index) => {
		if (random() < Leaflets.Skip) return;
		const length = (Leaflets.Shortest + random() * Leaflets.LengthRange) * region.width * shape.leafScale;
		[1, -1].forEach((side) => {
			const angle = Math.PI / 2 + side * Leaflets.Splay * (Leaflets.Hang + random());
			const tone = { lightness: Leaflets.Darkest + random() * Leaflets.Range, warmth: random() * Leaflets.Warmth - Leaflets.Cool };
			painter.leaf(x, y, angle, length * (1 - random() / (index + 2)), length * Leaflets.Width, tone);
		});
	});
}

function paintSprays(painter: AtlasPainter, region: PixelRegion, random: RandomFraction, shape: SprayShape) {
	const count = Math.round((Sprays.Fewest + Math.floor(random() * Sprays.Extra)) * shape.sprays);
	const sprays = Array.from({ length: count }, () => sprayPath(region, shape, random));
	sprays.forEach((points) => painter.stroke(points, Twig.Width * region.width * shape.leafScale, Twig.Tone));
	sprays.forEach((points) => paintLeaflets(painter, region, points, shape, random));
}

export const paintBirch = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintSprays(painter, region, random, Shapes.Near);
export const paintFineBirch = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => paintSprays(painter, region, random, Shapes.Fine);
