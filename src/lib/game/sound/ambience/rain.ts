import { startNoise } from '../synth/noise';
import { rampGain, type AmbientLayer } from './ambientLayer';

const Shower = { HighpassHertz: 1400, LowpassHertz: 6500, PeakGain: 0.14 } as const;

export function startRain(context: AudioContext, destination: AudioNode): AmbientLayer {
	const noise = startNoise(context, 'white');
	const highpass = context.createBiquadFilter();
	highpass.type = 'highpass';
	highpass.frequency.value = Shower.HighpassHertz;
	const lowpass = context.createBiquadFilter();
	lowpass.type = 'lowpass';
	lowpass.frequency.value = Shower.LowpassHertz;
	const level = context.createGain();
	level.gain.value = 0;
	noise.connect(highpass).connect(lowpass).connect(level).connect(destination);
	return {
		setLevel: (amount) => rampGain(level, context, amount * Shower.PeakGain),
		stop: () => noise.stop()
	};
}
