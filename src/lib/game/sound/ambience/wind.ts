import { startNoise } from '../synth/noise';
import { rampGain, startLfo, type AmbientLayer } from './ambientLayer';

const Gust = { LowHertz: 420, SweepHertz: 260, SweepRate: 0.06, PeakGain: 0.22, BreathRate: 0.21, BreathDepth: 0.35 } as const;

export function startWind(context: AudioContext, destination: AudioNode): AmbientLayer {
	const noise = startNoise(context, 'brown');
	const lowpass = context.createBiquadFilter();
	lowpass.type = 'lowpass';
	lowpass.frequency.value = Gust.LowHertz;
	const breath = context.createGain();
	breath.gain.value = 1;
	const level = context.createGain();
	level.gain.value = 0;
	noise.connect(lowpass).connect(breath).connect(level).connect(destination);
	const sweep = startLfo(context, Gust.SweepRate, Gust.SweepHertz, lowpass.frequency);
	const breathing = startLfo(context, Gust.BreathRate, Gust.BreathDepth, breath.gain);
	return {
		setLevel: (amount) => rampGain(level, context, amount * Gust.PeakGain),
		stop: () => [noise, sweep, breathing].forEach((node) => node.stop())
	};
}
