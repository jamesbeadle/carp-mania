const Hashing = { Across: 0x27d4eb2d, Down: 0x165667b1, Seeded: 0x9e3779b1, Mixer: 0x85ebca6b, FirstShift: 15, SecondShift: 13, Range: 4294967296 } as const;
const Octave = { Stretch: 2.31, Turn: 0.6, Weight: 0.35 } as const;

function hashed(column: number, row: number, seed: number) {
	const seeded = Math.imul(column, Hashing.Across) ^ Math.imul(row, Hashing.Down) ^ Math.imul(seed, Hashing.Seeded);
	const mixed = Math.imul(seeded ^ (seeded >>> Hashing.FirstShift), Hashing.Mixer);
	return ((mixed ^ (mixed >>> Hashing.SecondShift)) >>> 0) / Hashing.Range;
}

function eased(share: number) {
	return share * share * (3 - 2 * share);
}

function valueNoise(x: number, z: number, seed: number) {
	const column = Math.floor(x);
	const row = Math.floor(z);
	const across = eased(x - column);
	const down = eased(z - row);
	const upper = hashed(column, row, seed) + (hashed(column + 1, row, seed) - hashed(column, row, seed)) * across;
	const lower = hashed(column, row + 1, seed) + (hashed(column + 1, row + 1, seed) - hashed(column, row + 1, seed)) * across;
	return upper + (lower - upper) * down;
}

export function broadNoise(x: number, z: number, metres: number, seed: number) {
	const across = x / metres;
	const down = z / metres;
	const turnedAcross = (across + down * Octave.Turn) * Octave.Stretch;
	const turnedDown = (down - across * Octave.Turn) * Octave.Stretch;
	return valueNoise(across, down, seed) * (1 - Octave.Weight) + valueNoise(turnedAcross, turnedDown, seed + 1) * Octave.Weight;
}
