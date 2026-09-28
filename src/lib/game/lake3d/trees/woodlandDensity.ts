import type { WorldPoint } from '../lakeFrame';

const Clumping = { Wavelength: 45, Clearing: 0.35 } as const;

export function woodlandDensityAt(point: WorldPoint) {
	const wave = Math.sin(point.x / Clumping.Wavelength) * Math.cos(point.z / (Clumping.Wavelength * 0.7)) + Math.sin((point.x + point.z) / (Clumping.Wavelength * 1.9));
	return Math.min(1, Math.max(0, wave * 0.5 + Clumping.Clearing));
}
