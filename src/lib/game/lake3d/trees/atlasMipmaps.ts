export interface MipLevel {
	data: Uint8Array;
	width: number;
	height: number;
}

interface Size {
	width: number;
	height: number;
}

const Tent = [1, 3, 3, 1];
const TentTotal = 64;
const Channels = 4;
const Alpha = 3;
const Most = 255;
const CoverageGain = 1.28;

function texelOffset(size: Size, x: number, y: number) {
	const clampedX = Math.min(size.width - 1, Math.max(0, x));
	const clampedY = Math.min(size.height - 1, Math.max(0, y));
	return (clampedY * size.width + clampedX) * Channels;
}

const sums = new Float64Array(Channels);

function gatherTent(source: Uint8Array, size: Size, x: number, y: number) {
	sums.fill(0);
	for (let row = 0; row < Tent.length; row++) {
		for (let column = 0; column < Tent.length; column++) {
			const at = texelOffset(size, x * 2 + column - 1, y * 2 + row - 1);
			const weight = Tent[row] * Tent[column] * source[at + Alpha];
			sums[0] += source[at] * weight;
			sums[1] += source[at + 1] * weight;
			sums[2] += source[at + 2] * weight;
			sums[Alpha] += weight;
		}
	}
}

function filterTexel(source: Uint8Array, size: Size, x: number, y: number, target: Uint8Array, offset: number) {
	gatherTent(source, size, x, y);
	const coverage = sums[Alpha] / (TentTotal * Most);
	const fallback = texelOffset(size, x * 2, y * 2);
	for (let channel = 0; channel < Alpha; channel++) target[offset + channel] = sums[Alpha] > 0 ? sums[channel] / sums[Alpha] : source[fallback + channel];
	target[offset + Alpha] = Math.min(Most, coverage * CoverageGain * Most);
}

function halve(level: MipLevel): MipLevel {
	const half = { width: Math.max(1, level.width / 2), height: Math.max(1, level.height / 2) };
	const data = new Uint8Array(half.width * half.height * Channels);
	for (let y = 0; y < half.height; y++) for (let x = 0; x < half.width; x++) filterTexel(level.data, level, x, y, data, (y * half.width + x) * Channels);
	return { data, ...half };
}

export function mipLevelsOf(data: Uint8Array, size: Size): MipLevel[] {
	const levels: MipLevel[] = [{ data, ...size }];
	for (let level = levels[0]; level.width > 1 || level.height > 1; level = levels[levels.length - 1]) levels.push(halve(level));
	return levels;
}
