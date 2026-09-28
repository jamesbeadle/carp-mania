export interface MipLevel {
	data: Uint8Array;
	width: number;
	height: number;
}

const Tent = [1, 3, 3, 1];
const TentTotal = 64;
const Channels = 4;
const Alpha = 3;
const Most = 255;
const CoverageGain = 1.28;

function texelOffset(width: number, x: number, y: number) {
	const clampedX = Math.min(width - 1, Math.max(0, x));
	const clampedY = Math.min(width - 1, Math.max(0, y));
	return (clampedY * width + clampedX) * Channels;
}

const sums = new Float64Array(Channels);

function gatherTent(source: Uint8Array, width: number, x: number, y: number) {
	sums.fill(0);
	for (let row = 0; row < Tent.length; row++) {
		for (let column = 0; column < Tent.length; column++) {
			const at = texelOffset(width, x * 2 + column - 1, y * 2 + row - 1);
			const weight = Tent[row] * Tent[column] * source[at + Alpha];
			sums[0] += source[at] * weight;
			sums[1] += source[at + 1] * weight;
			sums[2] += source[at + 2] * weight;
			sums[Alpha] += weight;
		}
	}
}

function filterTexel(source: Uint8Array, width: number, x: number, y: number, target: Uint8Array, offset: number) {
	gatherTent(source, width, x, y);
	const coverage = sums[Alpha] / (TentTotal * Most);
	const fallback = texelOffset(width, x * 2, y * 2);
	for (let channel = 0; channel < Alpha; channel++) target[offset + channel] = sums[Alpha] > 0 ? sums[channel] / sums[Alpha] : source[fallback + channel];
	target[offset + Alpha] = Math.min(Most, coverage * CoverageGain * Most);
}

function halve(source: Uint8Array, width: number) {
	const half = width / 2;
	const target = new Uint8Array(half * half * Channels);
	for (let y = 0; y < half; y++) for (let x = 0; x < half; x++) filterTexel(source, width, x, y, target, (y * half + x) * Channels);
	return target;
}

export function mipLevelsOf(data: Uint8Array, size: number): MipLevel[] {
	const levels: MipLevel[] = [{ data, width: size, height: size }];
	for (let width = size; width > 1; width /= 2) {
		const previous = levels[levels.length - 1];
		levels.push({ data: halve(previous.data, width), width: width / 2, height: width / 2 });
	}
	return levels;
}
