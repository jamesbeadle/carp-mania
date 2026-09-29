import { seededRandom } from '$lib/domain/random';
import type { CarpStrain } from '$lib/domain/types';
import { FishPalette, type FishColours } from '../../scene/fishPalette';

export const Skin = { Width: 512, Height: 256, HeadShare: 0.2 } as const;

type Painter = (context: CanvasRenderingContext2D, colours: FishColours, random: () => number) => void;

const ScaleSeed = 41;
const AroundStretch = 2.2;
const Rows = { Common: 34, Even: 15 } as const;
const Flanks = { Lateral: [0.3, 0.7], Dorsal: 0.5, Spread: 26 } as const;
const Plates = { Smallest: 7, Range: 7 } as const;
const PlateEdge = { Fade: 0.7 } as const;
const PlateCounts = { MirrorDorsal: 14, MirrorLateral: 7, LinearLateral: 18, LinearDorsal: 12, GhostPatches: 12 } as const;
const Ink = { Edge: 'rgba(48, 30, 12, 0.5)', Shine: 'rgba(255, 244, 214, 0.22)', Rim: 'rgba(70, 44, 16, 0.55)' } as const;
const BodyRows = Skin.Height * (1 - Skin.HeadShare);

function scaleEdge(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
	context.beginPath();
	context.ellipse(x, y, radius * AroundStretch, radius, 0, 0.12, Math.PI - 0.12);
	context.stroke();
	context.beginPath();
	context.ellipse(x, y - radius * 0.3, radius * AroundStretch * 0.6, radius * 0.45, 0, 0, Math.PI * 2);
	context.fill();
}

function plate(context: CanvasRenderingContext2D, x: number, y: number, radius: number, colours: FishColours) {
	const glow = context.createRadialGradient(x, y - radius * 0.3, 0, x, y, radius * AroundStretch);
	glow.addColorStop(0, colours.scale);
	glow.addColorStop(PlateEdge.Fade, colours.flank);
	glow.addColorStop(1, colours.back);
	context.fillStyle = glow;
	context.beginPath();
	context.ellipse(x, y, radius * AroundStretch, radius, 0, 0, Math.PI * 2);
	context.fill();
	context.stroke();
}

function eachScaleOf(rows: number, draw: (x: number, y: number, radius: number) => void) {
	const step = BodyRows / rows;
	const across = step * AroundStretch * 1.7;
	for (let row = 0; row < rows; row++) {
		for (let x = (row % 2) * across * 0.5; x < Skin.Width; x += across) draw(x, Skin.Height * Skin.HeadShare + step * (row + 0.5), step * 0.62);
	}
}

function platesAlong(context: CanvasRenderingContext2D, share: number, count: number, colours: FishColours, random: () => number) {
	for (let index = 0; index < count; index++) {
		const y = Skin.Height * Skin.HeadShare + (index + 0.3 + random() * 0.4) * (BodyRows / count);
		plate(context, share * Skin.Width + (random() - 0.5) * Flanks.Spread, y, Plates.Smallest + random() * Plates.Range, colours);
	}
}

const common: Painter = (context) => {
	context.strokeStyle = Ink.Edge;
	context.fillStyle = Ink.Shine;
	context.lineWidth = 1.4;
	eachScaleOf(Rows.Common, (x, y, radius) => scaleEdge(context, x, y, radius));
};

const fullyScaled: Painter = (context, colours) => {
	context.strokeStyle = Ink.Rim;
	context.lineWidth = 1.2;
	eachScaleOf(Rows.Even, (x, y, radius) => plate(context, x, y, radius, colours));
};

const mirror: Painter = (context, colours, random) => {
	context.strokeStyle = Ink.Rim;
	platesAlong(context, Flanks.Dorsal, PlateCounts.MirrorDorsal, colours, random);
	Flanks.Lateral.forEach((share) => platesAlong(context, share, PlateCounts.MirrorLateral, colours, random));
};

const linear: Painter = (context, colours, random) => {
	context.strokeStyle = Ink.Rim;
	Flanks.Lateral.forEach((share) => platesAlong(context, share, PlateCounts.LinearLateral, colours, random));
	platesAlong(context, Flanks.Dorsal, PlateCounts.LinearDorsal, colours, random);
};

const ghost: Painter = (context, colours, random) => {
	context.fillStyle = colours.patch;
	for (let index = 0; index < PlateCounts.GhostPatches; index++) {
		context.beginPath();
		context.ellipse(Skin.Width * (0.35 + random() * 0.3), Skin.Height * (Skin.HeadShare + random() * 0.75), 20 + random() * 40, 8 + random() * 14, 0, 0, Math.PI * 2);
		context.fill();
	}
	common(context, colours, random);
};

const Painters: Record<CarpStrain, Painter> = { common, mirror, linear, fully_scaled: fullyScaled, ghost, leather: () => {} };

export function paintScales(context: CanvasRenderingContext2D, strain: CarpStrain) {
	Painters[strain](context, FishPalette[strain], seededRandom(ScaleSeed));
}
