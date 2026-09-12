export interface ToneShape {
	frequency: number;
	endFrequency?: number;
	type?: OscillatorType;
	seconds: number;
	gain: number;
	attackSeconds?: number;
	pan?: number;
}

const Envelope = { DefaultAttackSeconds: 0.005, Silence: 0.0001 } as const;

export function playTone(context: AudioContext, destination: AudioNode, shape: ToneShape, when = context.currentTime) {
	const oscillator = context.createOscillator();
	const envelope = context.createGain();
	const attack = shape.attackSeconds ?? Envelope.DefaultAttackSeconds;
	oscillator.type = shape.type ?? 'sine';
	oscillator.frequency.setValueAtTime(shape.frequency, when);
	if (shape.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(shape.endFrequency, when + shape.seconds);
	envelope.gain.setValueAtTime(Envelope.Silence, when);
	envelope.gain.linearRampToValueAtTime(shape.gain, when + attack);
	envelope.gain.exponentialRampToValueAtTime(Envelope.Silence, when + shape.seconds);
	oscillator.connect(envelope).connect(pannedTo(context, destination, shape.pan));
	oscillator.start(when);
	oscillator.stop(when + shape.seconds + attack);
}

function pannedTo(context: AudioContext, destination: AudioNode, pan: number | undefined): AudioNode {
	if (pan === undefined || typeof context.createStereoPanner !== 'function') return destination;
	const panner = context.createStereoPanner();
	panner.pan.value = pan;
	panner.connect(destination);
	return panner;
}
