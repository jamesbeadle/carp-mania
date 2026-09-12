import { startNoise } from '../synth/noise';
import { rampGain, startLfo, type AmbientLayer } from './ambientLayer';

const Lap = { BandHertz: 640, Q: 0.8, PeakGain: 0.1, SwellHertz: 0.17, SwellDepth: 0.5, RippleHertz: 0.9, RippleDepth: 0.15 } as const;

export function startWaterLap(context: AudioContext, destination: AudioNode): AmbientLayer {
	const noise = startNoise(context, 'white');
	const band = context.createBiquadFilter();
	band.type = 'bandpass';
	band.frequency.value = Lap.BandHertz;
	band.Q.value = Lap.Q;
	const swell = context.createGain();
	swell.gain.value = 1;
	const level = context.createGain();
	level.gain.value = 0;
	noise.connect(band).connect(swell).connect(level).connect(destination);
	const swellLfo = startLfo(context, Lap.SwellHertz, Lap.SwellDepth, swell.gain);
	const rippleLfo = startLfo(context, Lap.RippleHertz, Lap.RippleDepth, swell.gain);
	return {
		setLevel: (amount) => rampGain(level, context, amount * Lap.PeakGain),
		stop: () => [noise, swellLfo, rippleLfo].forEach((node) => node.stop())
	};
}
