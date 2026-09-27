import { seededRandom } from '$lib/domain/random';
import type { CarpStrain } from '$lib/domain/types';
import { FishPalette } from '../../scene/fishPalette';

export const Skin = { Width: 512, Height: 256, HeadShare: 0.2 } as const;

type Painter = (context: CanvasRenderingContext2D, colour: string, random: () => number) => void;

const ScaleSeed = 41;
const Rows = { Common: 16, Even: 9 } as const;
const Flanks = { Lateral: [0.25, 0.75], Dorsal: 0.5 } as const;

function plate(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
	context.beginPath();
	context.ellipse(x, y, radius, radius * 0.8, 0, 0, Math.PI * 2);
	context.fill();
	context.stroke();
}

function latticeOf(context: CanvasRenderingContext2D, rows: number, radiusShare: number) {
	const step = (Skin.Height * (1 - Skin.HeadShare)) / rows;
	for (let row = 0; row < rows; row++) {
		for (let x = (row % 2) * step * 0.5; x < Skin.Width; x += step) plate(context, x, Skin.Height * Skin.HeadShare + step * (row + 0.5), step * radiusShare);
	}
}

const common: Painter = (context, colour) => {
	context.strokeStyle = colour;
	context.fillStyle = 'transparent';
	context.lineWidth = 1.5;
	latticeOf(context, Rows.Common, 0.6);
};

const fullyScaled: Painter = (context, colour) => {
	context.fillStyle = colour;
	context.strokeStyle = 'rgba(0,0,0,0.25)';
	latticeOf(context, Rows.Even, 0.42);
};

function scatterAlong(context: CanvasRenderingContext2D, across: number, count: number, random: () => number) {
	for (let index = 0; index < count; index++) {
		const y = Skin.Height * (Skin.HeadShare + random() * (1 - Skin.HeadShare) * 0.95);
		plate(context, across * Skin.Width + (random() - 0.5) * 40, y, 9 + random() * 12);
	}
}

const mirror: Painter = (context, colour, random) => {
	context.fillStyle = colour;
	context.strokeStyle = 'rgba(40,25,10,0.35)';
	scatterAlong(context, Flanks.Dorsal, 16, random);
	Flanks.Lateral.forEach((across) => scatterAlong(context, across, 9, random));
};

const linear: Painter = (context, colour, random) => {
	context.fillStyle = colour;
	context.strokeStyle = 'rgba(40,25,10,0.35)';
	Flanks.Lateral.forEach((across) => scatterAlong(context, across, 18, random));
};

const ghost: Painter = (context, _colour, random) => {
	const ghostCarp = FishPalette.ghost;
	context.fillStyle = ghostCarp.patch;
	context.strokeStyle = 'transparent';
	scatterAlong(context, Flanks.Dorsal, 10, random);
};

const Painters: Record<CarpStrain, Painter> = { common, mirror, linear, fully_scaled: fullyScaled, ghost, leather: () => {} };

export function paintScales(context: CanvasRenderingContext2D, strain: CarpStrain) {
	Painters[strain](context, FishPalette[strain].scale, seededRandom(ScaleSeed));
}
