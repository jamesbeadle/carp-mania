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

function sampleAt(source: Uint8Array, width: number, x: number, y: number) {
	const clampedX = Math.min(width - 1, Math.max(0, x));
	const clampedY = Math.min(width - 1, Math.max(0, y));
	return (clampedY * width + clampedX) * Channels;
}

function filterTexel(source: Uint8Array, width: number, x: number, y: number, target: Uint8Array, offset: number) {
	const sums = [0, 0, 0, 0];
	Tent.forEach((down, row) => {
		Tent.forEach((across, column) => {
			const at = sampleAt(source, width, x * 2 + column - 1, y * 2 + row - 1);
			const weight = down * across * source[at + Alpha];
			for (let channel = 0; channel < Alpha; channel++) sums[channel] += source[at + channel] * weight;
			sums[Alpha] += weight;
		});
	});
	const coverage = sums[Alpha] / (TentTotal * Most);
	for (let channel = 0; channel < Alpha; channel++) target[offset + channel] = sums[Alpha] > 0 ? sums[channel] / sums[Alpha] : source[sampleAt(source, width, x * 2, y * 2) + channel];
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
