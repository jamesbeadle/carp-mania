import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';

const Broadleaf = { Filler: 70, FillerReach: 0.22, Longest: 0.1, Shortest: 0.07, Width: 0.48 } as const;
const Shading = { Darkest: 0.5, Range: 0.5, Warmth: 0.8, Cool: 0.3, TwigLightness: 0.35, TwigWidth: 0.006, Scatter: 1.4 } as const;
const FullTurn = Math.PI * 2;

function centreOf(region: PixelRegion) {
	return { x: region.left + region.width / 2, y: region.top + region.height / 2 };
}

function toneFor(share: number, random: RandomFraction) {
	return { lightness: Shading.Darkest + Shading.Range * share * (0.6 + random() * 0.4), warmth: random() * Shading.Warmth - Shading.Cool };
}

function scatterLeaves(painter: AtlasPainter, region: PixelRegion, centre: { x: number; y: number }, reach: number, count: number, brightest: number, random: RandomFraction) {
	const size = region.width;
	for (let index = 0; index < count; index++) {
		const angle = random() * FullTurn;
		const distance = Math.sqrt(random()) * reach * size;
		const x = centre.x + Math.cos(angle) * distance;
		const y = centre.y + Math.sin(angle) * distance;
		const length = (Broadleaf.Shortest + random() * (Broadleaf.Longest - Broadleaf.Shortest)) * size;
		const pointing = angle + (random() - 0.5) * Shading.Scatter * 2;
		painter.leaf(x, y, pointing, length, length * Broadleaf.Width, toneFor((brightest * (index + 1)) / count, random));
	}
}

const Sprigs = { Count: 8, Leaves: 8, Reach: 0.33, Start: 0.05, Longest: 0.11, Shortest: 0.075, Width: 0.5, Splay: 0.55, SplayRange: 0.5, Curl: 0.35 } as const;

function paintSprig(painter: AtlasPainter, region: PixelRegion, heading: number, random: RandomFraction) {
	const centre = centreOf(region);
	const size = region.width;
	const reach = Sprigs.Reach * (0.7 + random() * 0.3) * size;
	const curl = (random() - 0.5) * Sprigs.Curl;
	const pointAt = (along: number): [number, number] => {
		const turn = heading + curl * along;
		const distance = Sprigs.Start * size + along * reach;
		return [centre.x + Math.cos(turn) * distance, centre.y + Math.sin(turn) * distance];
	};
	painter.stroke([pointAt(0), pointAt(0.5), pointAt(1)], Shading.TwigWidth * size, { lightness: Shading.TwigLightness, warmth: 1 });
	for (let leaf = 0; leaf <= Sprigs.Leaves; leaf++) {
		const along = 0.2 + (0.8 * leaf) / Sprigs.Leaves;
		const [x, y] = pointAt(along);
		const side = leaf === Sprigs.Leaves ? 0 : leaf % 2 === 0 ? 1 : -1;
		const length = (Sprigs.Shortest + random() * (Sprigs.Longest - Sprigs.Shortest)) * size;
		const pointing = heading + curl * along + side * (Sprigs.Splay + random() * Sprigs.SplayRange);
		painter.leaf(x, y, pointing, length, length * Sprigs.Width, toneFor(0.45 + along * 0.55, random));
	}
}

export function paintBroadleaf(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	scatterLeaves(painter, region, centreOf(region), Broadleaf.FillerReach, Broadleaf.Filler, Shading.Range, random);
	for (let sprig = 0; sprig < Sprigs.Count; sprig++) paintSprig(painter, region, (sprig / Sprigs.Count) * FullTurn + random() * Shading.Scatter / 2, random);
}

const Birch = { Twigs: 13, LeavesPerTwig: 15, Droop: 0.07, TwigLength: 0.36, Longest: 0.06, Shortest: 0.04, Width: 0.55, Spread: 0.3 } as const;

export function paintBirch(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const size = region.width;
	const start = { x: region.left + size / 2, y: region.top + size * Birch.Spread };
	for (let twig = 0; twig < Birch.Twigs; twig++) {
		const heading = Math.PI / 2 + (twig / (Birch.Twigs - 1) - 0.5) * Math.PI * 1.1;
		const points: [number, number][] = [];
		for (let step = 0; step <= Birch.LeavesPerTwig; step++) {
			const along = (step / Birch.LeavesPerTwig) * Birch.TwigLength * size;
			points.push([start.x + Math.cos(heading) * along, start.y + Math.sin(heading) * along + Birch.Droop * size * (step / Birch.LeavesPerTwig) ** 2 * 3]);
		}
		painter.stroke(points, Shading.TwigWidth * size, { lightness: Shading.TwigLightness, warmth: 1 });
		points.slice(1).forEach(([x, y], index) => {
			const length = (Birch.Shortest + random() * (Birch.Longest - Birch.Shortest)) * size;
			const side = index % 2 === 0 ? 1 : -1;
			painter.leaf(x, y, heading + side * (0.6 + random() * 0.5), length, length * Birch.Width, toneFor(0.55 + random() * 0.45, random));
		});
	}
}
