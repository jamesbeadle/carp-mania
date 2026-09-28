import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';

const Willow = { Strands: 5, Margin: 0.1, Jitter: 0.8, LateStart: 0.2, Reach: 0.96, LeafSpacing: 0.02, Longest: 0.07, Shortest: 0.045, Width: 0.34, Hang: 0.5, Sway: 0.04, TipTaper: 0.55, Splay: 0.35, Lightest: 0.4, Warmth: 0.6, Cool: 0.1 } as const;
const Needles = { Tufts: 9, PerTuft: 90, TuftReach: 0.25, Longest: 0.17, Shortest: 0.08, Width: 0.008, Darkest: 0.5, Cool: 0.4 } as const;
const Spray = { SideTwigs: 30, NeedlesPerTwig: 12, Reach: 0.44, TipReach: 0.25, Base: 0.97, Length: 0.94, Needle: 0.03, ShortestNeedle: 0.7, NeedleRange: 0.5, Lean: 0.7, Angle: 0.8, Width: 0.0045, Darkest: 0.45, Warmth: 0.3, Cool: 0.35 } as const;
const Tones = { Twig: { lightness: 0.35, warmth: 1 }, TwigWidth: 0.012 } as const;
const FullTurn = Math.PI * 2;

export function paintWillow(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const { width, height } = region;
	for (let strand = 0; strand < Willow.Strands; strand++) {
		const x = region.left + width * (Willow.Margin + ((1 - Willow.Margin * 2) * (strand + random() * Willow.Jitter)) / Willow.Strands);
		const start = height * random() * Willow.LateStart;
		const length = height * (1 - Willow.Hang * random()) * Willow.Reach - start;
		const phase = random() * FullTurn;
		const points: [number, number][] = [];
		for (let y = start; y <= start + length; y += Willow.LeafSpacing * height) points.push([x + Math.sin(phase + (y / height) * Math.PI * 2) * Willow.Sway * width, region.top + y]);
		painter.stroke(points, (Tones.TwigWidth * width) / 2, Tones.Twig);
		points.forEach(([leafX, leafY], index) => {
			const taper = 1 - (index / points.length) * Willow.TipTaper;
			const leafLength = (Willow.Shortest + random() * (Willow.Longest - Willow.Shortest)) * height * taper;
			const side = index % 2 === 0 ? 1 : -1;
			const tone = { lightness: 1 - Willow.Lightest + random() * Willow.Lightest, warmth: random() * Willow.Warmth - Willow.Cool };
			painter.leaf(leafX, leafY, Math.PI / 2 - side * Willow.Splay * (1 + random()), leafLength, leafLength * Willow.Width, tone);
		});
	}
}

export function paintNeedles(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const size = region.width;
	const centre = { x: region.left + size / 2, y: region.top + size / 2 };
	for (let tuft = 0; tuft < Needles.Tufts; tuft++) {
		const angle = random() * FullTurn;
		const distance = Math.sqrt(random()) * Needles.TuftReach * size;
		const tuftCentre = { x: centre.x + Math.cos(angle) * distance, y: centre.y + Math.sin(angle) * distance };
		painter.stroke([[centre.x, centre.y], [tuftCentre.x, tuftCentre.y]], Tones.TwigWidth * size, Tones.Twig);
		for (let needle = 0; needle < Needles.PerTuft; needle++) {
			const pointing = random() * FullTurn;
			const length = (Needles.Shortest + random() * (Needles.Longest - Needles.Shortest)) * size;
			const tip: [number, number] = [tuftCentre.x + Math.cos(pointing) * length, tuftCentre.y + Math.sin(pointing) * length];
			painter.stroke([[tuftCentre.x, tuftCentre.y], tip], Needles.Width * size, { lightness: Needles.Darkest + random() * (1 - Needles.Darkest), warmth: (random() - 1) * Needles.Cool });
		}
	}
}

export function paintSpray(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const { width, height } = region;
	const middle = region.left + width / 2;
	const base = region.top + height * Spray.Base;
	const at = (along: number, sideways: number): [number, number] => [middle + sideways * width, base - along * height * Spray.Length];
	painter.stroke([at(0, 0), at(1, 0)], Tones.TwigWidth * width, Tones.Twig);
	for (let twig = 0; twig < Spray.SideTwigs; twig++) {
		const along = (twig + 1 / 2) / Spray.SideTwigs;
		const side = twig % 2 === 0 ? 1 : -1;
		const reach = Spray.Reach * (Spray.TipReach + (1 - Spray.TipReach) * (1 - along));
		const tipAlong = along + (Math.cos(Spray.Angle) * reach * width) / height;
		const tipSideways = side * Math.sin(Spray.Angle) * reach;
		painter.stroke([at(along, 0), at(tipAlong, tipSideways)], Spray.Width * height, Tones.Twig);
		for (let needle = 0; needle <= Spray.NeedlesPerTwig; needle++) {
			const share = needle / Spray.NeedlesPerTwig;
			const [x, y] = at(along + (tipAlong - along) * share, tipSideways * share);
			const length = Spray.Needle * height * (Spray.ShortestNeedle + random() * Spray.NeedleRange);
			const tone = { lightness: Spray.Darkest + random() * (1 - Spray.Darkest), warmth: random() * Spray.Warmth - Spray.Cool };
			painter.stroke([[x, y], [x - length, y - length * Spray.Lean]], Spray.Width * height, tone);
			painter.stroke([[x, y], [x + length, y - length * Spray.Lean]], Spray.Width * height, tone);
		}
	}
}
