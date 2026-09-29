import type { WorldPoint } from '../lakeFrame';

const Hashing = { Across: 374761393, Down: 668265263, Seed: 1442695041, Mix: 1274126177, Shift: 13, FinalShift: 16, Range: 4294967296 } as const;
const Octave = { Detail: 2.03, Weight: 0.35 } as const;

function hash(across: number, down: number, seed: number) {
	const mixed = Math.imul(across, Hashing.Across) ^ Math.imul(down, Hashing.Down) ^ Math.imul(seed, Hashing.Seed);
	const stirred = Math.imul(mixed ^ (mixed >>> Hashing.Shift), Hashing.Mix);
	return ((stirred ^ (stirred >>> Hashing.FinalShift)) >>> 0) / Hashing.Range;
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
