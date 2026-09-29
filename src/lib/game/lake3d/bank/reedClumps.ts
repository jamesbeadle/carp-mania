import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { CoverNoise } from '../grass/coverNoise';

export interface ReedClump {
	centre: WorldPoint;
	radius: number;
	height: number;
	lean: number;
	straw: number;
	fullness: number;
}

export interface ClumpContext {
	noise: CoverNoise;
	random: RandomFraction;
}

const Clumps = { StepMetres: 0.9, Across: 2.6, Smallest: 0.6, Largest: 1.7, EndTaper: 0.16 } as const;
const Presence = { Wavelength: 7, Threshold: 0.47, EndPenalty: 0.3 } as const;
const Height = { Wavelength: 9, NoiseFrom: 0.3, NoiseTo: 0.7, Lowest: 0.5, Highest: 1.45, Swing: 0.4, AtTheEnds: 0.55 } as const;
const Lean = { LeaningShare: 0.35, Most: 0.16, Upright: 0.035 } as const;
const Straw = { Share: 0.25, Least: 0.3, Range: 0.3, GreenMost: 0.12 } as const;

function ramp(value: number, from: number, to: number) {
	return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

function taperAt(along: number) {
	return Math.min(1, along / Clumps.EndTaper, (1 - along) / Clumps.EndTaper);
}

function clumpAt(centre: WorldPoint, taper: number, context: ClumpContext): ReedClump | null {
	const { noise, random } = context;
	const presence = noise.at(centre, Presence.Wavelength);
	if (presence < Presence.Threshold + (1 - taper) * Presence.EndPenalty) return null;
	const rise = ramp(noise.at({ x: centre.z, z: centre.x }, Height.Wavelength), Height.NoiseFrom, Height.NoiseTo);
	const endShrink = Height.AtTheEnds + (1 - Height.AtTheEnds) * taper;
	const height = (Height.Lowest + (Height.Highest - Height.Lowest) * rise) * (1 + (random() - 1 / 2) * Height.Swing) * endShrink;
	const radius = (Clumps.Smallest + random() * (Clumps.Largest - Clumps.Smallest)) * endShrink;
	const lean = random() < Lean.LeaningShare ? random() * Lean.Most : random() * Lean.Upright;
	const straw = random() < Straw.Share ? Straw.Least + random() * Straw.Range : random() * Straw.GreenMost;
	return { centre, radius, height, lean, straw, fullness: ramp(presence, Presence.Threshold, 1) };
}

function lineLength(line: WorldPoint[]) {
	return line.slice(1).reduce((total, point, index) => total + Math.hypot(point.x - line[index].x, point.z - line[index].z), 0);
}

export function reedClumpsAlong(line: WorldPoint[], context: ClumpContext) {
	const total = Math.max(lineLength(line), Number.EPSILON);
	let travelled = 0;
	return line.slice(1).flatMap((end, index) => {
		const start = line[index];
		const length = Math.hypot(end.x - start.x, end.z - start.z);
		const across = { x: -(end.z - start.z) / Math.max(length, Number.EPSILON), z: (end.x - start.x) / Math.max(length, Number.EPSILON) };
		const steps = Math.ceil(length / Clumps.StepMetres);
		const clumps = Array.from({ length: steps }, (_, step) => {
			const share = (step + context.random()) / steps;
			const offset = (context.random() * 2 - 1) * Clumps.Across;
			const centre = { x: start.x + (end.x - start.x) * share + across.x * offset, z: start.z + (end.z - start.z) * share + across.z * offset };
			return clumpAt(centre, taperAt((travelled + length * share) / total), context);
		});
		travelled += length;
		return clumps.filter((clump): clump is ReedClump => clump !== null);
	});
}
