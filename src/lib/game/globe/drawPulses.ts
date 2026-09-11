import type { GeoProjection } from 'd3-geo';
import { pulseColour } from './globePalette';
import { projectVisible, type GlobeView } from './projection';

export type PulseKind = 'big_catch' | 'record';

export interface GlobePulse {
	latitude: number;
	longitude: number;
	kind: PulseKind;
	startedAt: number;
}

export const PulseTiming = { LifetimeMs: 6_000, PeriodMs: 1_800 } as const;
const PulseShape = { MaximumRadiusPx: 26, LineWidth: 2, SecondRingPhase: 0.5 } as const;
const RingPhases: Record<PulseKind, number[]> = { big_catch: [0], record: [0, PulseShape.SecondRingPhase] };

export function drawPulses(context: CanvasRenderingContext2D, projection: GeoProjection, view: GlobeView, pulses: GlobePulse[], now: number) {
	for (const pulse of pulses) {
		const age = now - pulse.startedAt;
		if (age < 0 || age > PulseTiming.LifetimeMs) continue;
		const projected = projectVisible(projection, view, pulse);
		if (!projected) continue;
		for (const phase of RingPhases[pulse.kind]) drawRing(context, projected[0], projected[1], age, phase);
	}
}

function drawRing(context: CanvasRenderingContext2D, x: number, y: number, age: number, phase: number) {
	const ringProgress = (age / PulseTiming.PeriodMs + phase) % 1;
	const remainingLife = 1 - age / PulseTiming.LifetimeMs;
	context.beginPath();
	context.arc(x, y, ringProgress * PulseShape.MaximumRadiusPx, 0, Math.PI * 2);
	context.strokeStyle = pulseColour((1 - ringProgress) * remainingLife);
	context.lineWidth = PulseShape.LineWidth;
	context.stroke();
}
