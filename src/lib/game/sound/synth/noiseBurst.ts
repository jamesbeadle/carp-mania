import { startNoise, type NoiseColour } from './noise';

export interface BurstShape {
	colour: NoiseColour;
	seconds: number;
	gain: number;
	filter?: { type: BiquadFilterType; from: number; to: number; q?: number };
	attackSeconds?: number;
}

const Envelope = { DefaultAttackSeconds: 0.004, Silence: 0.0001 } as const;

export function playNoiseBurst(context: AudioContext, destination: AudioNode, shape: BurstShape, when = context.currentTime) {
	const source = startNoise(context, shape.colour, when);
	const envelope = context.createGain();
	const attack = shape.attackSeconds ?? Envelope.DefaultAttackSeconds;
	envelope.gain.setValueAtTime(Envelope.Silence, context.currentTime);
	envelope.gain.setValueAtTime(Envelope.Silence, when);
	envelope.gain.linearRampToValueAtTime(shape.gain, when + attack);
	envelope.gain.exponentialRampToValueAtTime(Envelope.Silence, when + shape.seconds);
	source.connect(filteredTo(context, envelope, shape, when));
	envelope.connect(destination);
	source.stop(when + shape.seconds + attack);
}

function filteredTo(context: AudioContext, envelope: GainNode, shape: BurstShape, when: number): AudioNode {
	if (!shape.filter) return envelope;
	const filter = context.createBiquadFilter();
	filter.type = shape.filter.type;
	filter.Q.value = shape.filter.q ?? 1;
	filter.frequency.setValueAtTime(shape.filter.from, when);
	filter.frequency.exponentialRampToValueAtTime(shape.filter.to, when + shape.seconds);
	filter.connect(envelope);
	return filter;
}
