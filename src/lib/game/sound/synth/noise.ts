export type NoiseColour = 'white' | 'brown';

const NoiseSeconds = 2;
const BrownLeak = 0.02;
const BrownGain = 3.5;
const buffers = new WeakMap<AudioContext, Map<NoiseColour, AudioBuffer>>();

export function noiseBufferFor(context: AudioContext, colour: NoiseColour): AudioBuffer {
	const cached = buffers.get(context) ?? new Map<NoiseColour, AudioBuffer>();
	buffers.set(context, cached);
	const existing = cached.get(colour);
	if (existing) return existing;
	const created = colour === 'white' ? whiteNoise(context) : brownNoise(context);
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

function whiteNoise(context: AudioContext) {
	const buffer = context.createBuffer(1, context.sampleRate * NoiseSeconds, context.sampleRate);
	const samples = buffer.getChannelData(0);
	for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
	return buffer;
}

function brownNoise(context: AudioContext) {
	const buffer = context.createBuffer(1, context.sampleRate * NoiseSeconds, context.sampleRate);
	const samples = buffer.getChannelData(0);
	let last = 0;
	for (let index = 0; index < samples.length; index++) {
		last = (last + BrownLeak * (Math.random() * 2 - 1)) / (1 + BrownLeak);
		samples[index] = last * BrownGain;
	}
	return buffer;
}
