export type NoiseColour = 'white' | 'brown';

const NoiseSeconds = 4;
const SeamSeconds = 0.25;
const BrownLeak = 0.02;
const BrownGain = 3.5;
const buffers = new WeakMap<AudioContext, Map<NoiseColour, AudioBuffer>>();

export function noiseBufferFor(context: AudioContext, colour: NoiseColour): AudioBuffer {
	const cached = buffers.get(context) ?? new Map<NoiseColour, AudioBuffer>();
	buffers.set(context, cached);
	const existing = cached.get(colour);
	if (existing) return existing;
	const seam = Math.floor(context.sampleRate * SeamSeconds);
	const count = context.sampleRate * NoiseSeconds + seam;
	const samples = colour === 'white' ? whiteNoise(count) : brownNoise(count);
	const created = seamlessLoop(context, samples, seam);
	cached.set(colour, created);
	return created;
}

export function startNoise(context: AudioContext, colour: NoiseColour, when = context.currentTime): AudioBufferSourceNode {
	const source = context.createBufferSource();
	source.buffer = noiseBufferFor(context, colour);
	source.loop = true;
	source.start(when);
	return source;
}

function whiteNoise(count: number) {
	const samples = new Float32Array(count);
	for (let index = 0; index < count; index++) samples[index] = Math.random() * 2 - 1;
	return samples;
}

function brownNoise(count: number) {
	const samples = new Float32Array(count);
	let last = 0;
	for (let index = 0; index < count; index++) {
		last = (last + BrownLeak * (Math.random() * 2 - 1)) / (1 + BrownLeak);
		samples[index] = last * BrownGain;
	}
	return samples;
}

function seamlessLoop(context: AudioContext, samples: Float32Array, seam: number) {
	const length = samples.length - seam;
	const buffer = context.createBuffer(1, length, context.sampleRate);
	const looped = buffer.getChannelData(0);
	looped.set(samples.subarray(0, length));
	for (let index = 0; index < seam; index++) {
		const fadeIn = index / seam;
		looped[index] = samples[index] * fadeIn + samples[length + index] * (1 - fadeIn);
	}
	return buffer;
}
