import { startNoise } from './noise';
import { playNoiseBurst } from './noiseBurst';
import { playTone } from './tone';

export type LoopName = 'alarm' | 'reel' | 'clutch';

export interface SoundLoop {
	stop(): void;
}

const Alarm = { HighHertz: 2600, LowHertz: 2100, BeepSeconds: 0.09, GapMilliseconds: 170, Gain: 0.28 } as const;
const Reel = { GapMilliseconds: 75, ClickSeconds: 0.012, Gain: 0.12, HighpassHertz: 2600 } as const;
const Clutch = { Frequency: 1350, VibratoHertz: 7, VibratoDepth: 45, Gain: 0.045, NoiseGain: 0.035, NoiseHighpassHertz: 1800, ReleaseSeconds: 0.12 } as const;

type Starter = (context: AudioContext, destination: AudioNode) => SoundLoop;

const Starters: Record<LoopName, Starter> = {
	alarm: (context, destination) => {
		let isHighTone = true;
		const beep = () => {
			playTone(context, destination, { frequency: isHighTone ? Alarm.HighHertz : Alarm.LowHertz, type: 'square', seconds: Alarm.BeepSeconds, gain: Alarm.Gain });
			isHighTone = !isHighTone;
		};
		return repeating(beep, Alarm.GapMilliseconds);
	},
	reel: (context, destination) => {
		const click = () => playNoiseBurst(context, destination, { colour: 'white', seconds: Reel.ClickSeconds, gain: Reel.Gain, filter: { type: 'highpass', from: Reel.HighpassHertz, to: Reel.HighpassHertz } });
		return repeating(click, Reel.GapMilliseconds);
	},
	clutch: (context, destination) => startClutch(context, destination)
};

export function startLoop(context: AudioContext, destination: AudioNode, name: LoopName): SoundLoop {
	return Starters[name](context, destination);
}

function repeating(play: () => void, gapMilliseconds: number): SoundLoop {
	play();
	const handle = setInterval(play, gapMilliseconds);
	return { stop: () => clearInterval(handle) };
}

function startClutch(context: AudioContext, destination: AudioNode): SoundLoop {
	const whine = context.createOscillator();
	const vibrato = context.createOscillator();
	const vibratoDepth = context.createGain();
	const noise = startNoise(context, 'white');
	const noiseFilter = context.createBiquadFilter();
	const noiseLevel = context.createGain();
	const level = context.createGain();
	whine.type = 'sawtooth';
	whine.frequency.value = Clutch.Frequency;
	vibrato.frequency.value = Clutch.VibratoHertz;
	vibratoDepth.gain.value = Clutch.VibratoDepth;
	vibrato.connect(vibratoDepth).connect(whine.frequency);
	noiseFilter.type = 'highpass';
	noiseFilter.frequency.value = Clutch.NoiseHighpassHertz;
	noiseLevel.gain.value = Clutch.NoiseGain / Clutch.Gain;
	level.gain.setValueAtTime(0, context.currentTime);
	level.gain.linearRampToValueAtTime(Clutch.Gain, context.currentTime + Clutch.ReleaseSeconds);
	whine.connect(level);
	noise.connect(noiseFilter).connect(noiseLevel).connect(level);
	level.connect(destination);
	whine.start();
	vibrato.start();
	return {
		stop: () => {
			const at = context.currentTime + Clutch.ReleaseSeconds;
			level.gain.linearRampToValueAtTime(0, at);
			whine.stop(at);
			vibrato.stop(at);
			noise.stop(at);
		}
	};
}
