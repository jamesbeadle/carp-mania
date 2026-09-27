import { MathUtils } from 'three';
import type { PodRod } from './podRod';

const Swing = { Seconds: 0.7, BackPitch: -1.25, ForwardPitch: -0.12, BackShare: 0.4, ForwardShare: 0.6 } as const;
const Fight = { Pitch: -0.95, MostYaw: 0.9, LeastBend: 2, BendPerTension: 9 } as const;
const Bite = { Flashes: 9, Bounce: 0.06, BrightLed: 3.2, DimLed: 0.35, Twitch: 1.6 } as const;

export function swingPitch(rod: PodRod, secondsSinceCast: number) {
	const share = secondsSinceCast / Swing.Seconds;
	if (share >= 1) return rod.restingPitch;
	if (share < Swing.BackShare) return MathUtils.lerp(rod.restingPitch, Swing.BackPitch, share / Swing.BackShare);
	if (share < Swing.ForwardShare) return MathUtils.lerp(Swing.BackPitch, Swing.ForwardPitch, (share - Swing.BackShare) / (Swing.ForwardShare - Swing.BackShare));
	return MathUtils.lerp(Swing.ForwardPitch, rod.restingPitch, (share - Swing.ForwardShare) / (1 - Swing.ForwardShare));
}

export function restRod(rod: PodRod, secondsSinceCast: number) {
	rod.pose(swingPitch(rod, secondsSinceCast));
	rod.bend(0);
	rod.lightAlarm(Bite.DimLed);
	rod.liftHanger(0);
}

export function sounderRod(rod: PodRod, timeSeconds: number) {
	const beat = Math.sin(timeSeconds * Bite.Flashes);
	rod.pose(rod.restingPitch);
	rod.bend(Math.abs(Math.sin(timeSeconds * Bite.Flashes * 0.5)) * Bite.Twitch);
	rod.lightAlarm(beat > 0 ? Bite.BrightLed : Bite.DimLed);
	rod.liftHanger(Math.abs(beat) * Bite.Bounce);
}

export function playFish(rod: PodRod, yawToFish: number, tension: number) {
	rod.pose(Fight.Pitch, MathUtils.clamp(yawToFish, -Fight.MostYaw, Fight.MostYaw));
	rod.bend(Fight.LeastBend + tension * Fight.BendPerTension);
	rod.lightAlarm(Bite.DimLed);
}
