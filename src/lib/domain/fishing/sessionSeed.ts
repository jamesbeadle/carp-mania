const Murmur = { Multiplier: 0x5bd1e995, KeyShift: 24, FinalShifts: [13, 15] } as const;

export function mix(seed: number, rodIndex: number, hour: number) {
	let hash = seed >>> 0;
	for (const part of [rodIndex, hour]) hash = (Math.imul(hash, Murmur.Multiplier) ^ scrambled(part + 1)) >>> 0;
	hash ^= hash >>> Murmur.FinalShifts[0];
	hash = Math.imul(hash, Murmur.Multiplier);
	hash ^= hash >>> Murmur.FinalShifts[1];
	return hash >>> 0;
}

function scrambled(part: number) {
	let key = Math.imul(part, Murmur.Multiplier);
	key ^= key >>> Murmur.KeyShift;
	return Math.imul(key, Murmur.Multiplier);
}
