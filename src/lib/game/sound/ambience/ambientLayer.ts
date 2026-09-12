export interface AmbientLayer {
	setLevel(level: number): void;
	stop(): void;
}

export const LevelRampSeconds = 1.5;

export function rampGain(gain: GainNode, context: AudioContext, target: number) {
	gain.gain.cancelScheduledValues(context.currentTime);
	gain.gain.setValueAtTime(gain.gain.value, context.currentTime);
	gain.gain.linearRampToValueAtTime(target, context.currentTime + LevelRampSeconds);
}

export function startLfo(context: AudioContext, hertz: number, depth: number, target: AudioParam) {
	const lfo = context.createOscillator();
	const amount = context.createGain();
	lfo.frequency.value = hertz;
	amount.gain.value = depth;
	lfo.connect(amount).connect(target);
	lfo.start();
	return lfo;
}
