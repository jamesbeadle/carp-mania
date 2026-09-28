import type { RandomFraction } from '$lib/domain/random';
import type { AtlasPainter, PixelRegion } from './atlasPainter';

const Willow = { Strands: 6, LeafSpacing: 0.016, Longest: 0.075, Shortest: 0.05, Width: 0.38, Hang: 0.25, Sway: 0.05 } as const;
const Needles = { Tufts: 9, PerTuft: 90, TuftReach: 0.25, Longest: 0.17, Shortest: 0.08, Width: 0.008 } as const;
const Spray = { SideTwigs: 30, NeedlesPerTwig: 12, Reach: 0.44, Needle: 0.03, Angle: 0.8, Width: 0.0045 } as const;
const Tones = { Twig: { lightness: 0.35, warmth: 1 }, TwigWidth: 0.012 } as const;
const FullTurn = Math.PI * 2;

export function paintWillow(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const { width, height } = region;
	for (let strand = 0; strand < Willow.Strands; strand++) {
		const x = region.left + width * (0.12 + (0.76 * (strand + random() * 0.6)) / Willow.Strands);
		const length = height * (1 - Willow.Hang * random()) * 0.96;
		const phase = random() * FullTurn;
		const points: [number, number][] = [];
		for (let y = 0; y <= length; y += Willow.LeafSpacing * height) points.push([x + Math.sin(phase + y / height * Math.PI * 2) * Willow.Sway * width, region.top + y]);
		painter.stroke(points, Tones.TwigWidth * width, Tones.Twig);
		points.forEach(([leafX, leafY], index) => {
			const leafLength = (Willow.Shortest + random() * (Willow.Longest - Willow.Shortest)) * height;
			const side = index % 2 === 0 ? 1 : -1;
			painter.leaf(leafX, leafY, Math.PI / 2 - side * (0.5 + random() * 0.4), leafLength, leafLength * Willow.Width, { lightness: 0.6 + random() * 0.4, warmth: random() * 0.6 - 0.1 });
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
			painter.stroke([[tuftCentre.x, tuftCentre.y], tip], Needles.Width * size, { lightness: 0.5 + random() * 0.5, warmth: random() * 0.4 - 0.4 });
		}
	}
}

export function paintSpray(painter: AtlasPainter, region: PixelRegion, random: RandomFraction) {
	const { width, height } = region;
	const middle = region.left + width / 2;
	const base = region.top + height * 0.97;
	const at = (along: number, sideways: number): [number, number] => [middle + sideways * width, base - along * height * 0.94];
	painter.stroke([at(0, 0), at(1, 0)], Tones.TwigWidth * width, Tones.Twig);
	for (let twig = 0; twig < Spray.SideTwigs; twig++) {
		const along = (twig + 0.5) / Spray.SideTwigs;
		const side = twig % 2 === 0 ? 1 : -1;
		const reach = Spray.Reach * (1 - along * 0.75);
		const tipAlong = along + (Math.cos(Spray.Angle) * reach * width) / height;
		const tipSideways = side * Math.sin(Spray.Angle) * reach;
		painter.stroke([at(along, 0), at(tipAlong, tipSideways)], Spray.Width * height, Tones.Twig);
		for (let needle = 0; needle <= Spray.NeedlesPerTwig; needle++) {
			const share = needle / Spray.NeedlesPerTwig;
			const [x, y] = at(along + (tipAlong - along) * share, tipSideways * share);
			const length = Spray.Needle * height * (0.7 + random() * 0.5);
			const tone = { lightness: 0.45 + random() * 0.55, warmth: random() * 0.3 - 0.35 };
			painter.stroke([[x, y], [x - length, y - length * 0.7]], Spray.Width * height, tone);
			painter.stroke([[x, y], [x + length, y - length * 0.7]], Spray.Width * height, tone);
		}
	}
}
