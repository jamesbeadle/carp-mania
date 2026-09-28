import type { WorldPoint } from '../lakeFrame';

const Hashing = { Across: 127.1, Down: 311.7, Spread: 43758.5453, SeedStep: 17.31 } as const;
const Octave = { Detail: 2.03, Weight: 0.35 } as const;

function hash(across: number, down: number, seed: number) {
	const value = Math.sin(across * Hashing.Across + down * Hashing.Down + seed * Hashing.SeedStep) * Hashing.Spread;
	return value - Math.floor(value);
}

function eased(share: number) {
	return share * share * (3 - 2 * share);
}

function valueNoise(across: number, down: number, seed: number) {
	const cellAcross = Math.floor(across);
	const cellDown = Math.floor(down);
	const shareAcross = eased(across - cellAcross);
	const shareDown = eased(down - cellDown);
	const top = hash(cellAcross, cellDown, seed) * (1 - shareAcross) + hash(cellAcross + 1, cellDown, seed) * shareAcross;
	const bottom = hash(cellAcross, cellDown + 1, seed) * (1 - shareAcross) + hash(cellAcross + 1, cellDown + 1, seed) * shareAcross;
	return top * (1 - shareDown) + bottom * shareDown;
}

export class CoverNoise {
	constructor(private readonly seed: number) {}

	at(point: WorldPoint, wavelength: number) {
		const across = point.x / wavelength;
		const down = point.z / wavelength;
		const broad = valueNoise(across, down, this.seed);
		const fine = valueNoise(across * Octave.Detail, down * Octave.Detail, this.seed + 1);
		return (broad + fine * Octave.Weight) / (1 + Octave.Weight);
	}
}
