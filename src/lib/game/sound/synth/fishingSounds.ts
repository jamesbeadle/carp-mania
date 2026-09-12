import { playNoiseBurst } from './noiseBurst';
import { playTone } from './tone';

export type FishingSoundName = 'cast' | 'strike' | 'net' | 'snap' | 'hook_pulled' | 'scales_tick' | 'scales_settle' | 'personal_best' | 'record' | 'rise';

const Whoosh = { From: 400, To: 3200, Seconds: 0.32, Gain: 0.14 } as const;
const Plop = { Delay: 0.55, From: 240, To: 90, Seconds: 0.14, Gain: 0.12, SplashSeconds: 0.09, SplashGain: 0.09, SplashFrom: 2400, SplashTo: 400 } as const;
const Whip = { From: 900, To: 180, Seconds: 0.09, Gain: 0.1, ClickSeconds: 0.02, ClickGain: 0.08 } as const;
const Splash = { From: 3200, To: 260, Seconds: 0.55, Gain: 0.2, GurgleDelay: 0.25, GurgleSeconds: 0.5, GurgleGain: 0.09 } as const;
const Crack = { Seconds: 0.035, Gain: 0.2, From: 700, To: 140, FallSeconds: 0.3, FallGain: 0.07 } as const;
const Twang = { From: 300, To: 170, Seconds: 0.22, Gain: 0.08 } as const;
const Tick = { Frequency: 1800, Seconds: 0.018, Gain: 0.05 } as const;
const Settle = { Clunk: 260, ClunkSeconds: 0.14, ClunkGain: 0.1, Beep: 1250, BeepDelay: 0.1, BeepSeconds: 0.16, BeepGain: 0.06 } as const;
const Rise = { From: 320, To: 130, Seconds: 0.1, Gain: 0.045, SplashSeconds: 0.07, SplashGain: 0.025, SplashFrom: 2000, SplashTo: 500 } as const;
const PersonalBest = { Notes: [523, 659, 784], Seconds: 0.35, Gap: 0.13, Gain: 0.08 } as const;
const Fanfare = { Notes: [523, 659, 784, 1047], Seconds: 0.28, Gap: 0.14, Gain: 0.09, ChordSeconds: 0.9, ChordGain: 0.06 } as const;

type Player = (context: AudioContext, destination: AudioNode, now: number) => void;

const Players: Record<FishingSoundName, Player> = {
	cast: (context, destination, now) => {
		playNoiseBurst(context, destination, { colour: 'white', seconds: Whoosh.Seconds, gain: Whoosh.Gain, filter: { type: 'bandpass', from: Whoosh.From, to: Whoosh.To, q: 0.8 } }, now);
		playTone(context, destination, { frequency: Plop.From, endFrequency: Plop.To, seconds: Plop.Seconds, gain: Plop.Gain }, now + Plop.Delay);
		playNoiseBurst(context, destination, { colour: 'white', seconds: Plop.SplashSeconds, gain: Plop.SplashGain, filter: { type: 'lowpass', from: Plop.SplashFrom, to: Plop.SplashTo } }, now + Plop.Delay);
	},
	strike: (context, destination, now) => {
		playNoiseBurst(context, destination, { colour: 'white', seconds: Whip.ClickSeconds, gain: Whip.ClickGain }, now);
		playTone(context, destination, { frequency: Whip.From, endFrequency: Whip.To, type: 'triangle', seconds: Whip.Seconds, gain: Whip.Gain }, now);
	},
	net: (context, destination, now) => {
		playNoiseBurst(context, destination, { colour: 'white', seconds: Splash.Seconds, gain: Splash.Gain, filter: { type: 'lowpass', from: Splash.From, to: Splash.To } }, now);
		playNoiseBurst(context, destination, { colour: 'brown', seconds: Splash.GurgleSeconds, gain: Splash.GurgleGain, attackSeconds: 0.1 }, now + Splash.GurgleDelay);
	},
	snap: (context, destination, now) => {
		playNoiseBurst(context, destination, { colour: 'white', seconds: Crack.Seconds, gain: Crack.Gain }, now);
		playTone(context, destination, { frequency: Crack.From, endFrequency: Crack.To, type: 'sawtooth', seconds: Crack.FallSeconds, gain: Crack.FallGain }, now);
	},
	hook_pulled: (context, destination, now) => {
		playTone(context, destination, { frequency: Twang.From, endFrequency: Twang.To, type: 'triangle', seconds: Twang.Seconds, gain: Twang.Gain }, now);
	},
	scales_tick: (context, destination, now) => {
		playTone(context, destination, { frequency: Tick.Frequency, seconds: Tick.Seconds, gain: Tick.Gain }, now);
	},
	scales_settle: (context, destination, now) => {
		playTone(context, destination, { frequency: Settle.Clunk, seconds: Settle.ClunkSeconds, gain: Settle.ClunkGain, type: 'triangle' }, now);
		playTone(context, destination, { frequency: Settle.Beep, seconds: Settle.BeepSeconds, gain: Settle.BeepGain }, now + Settle.BeepDelay);
	},
	personal_best: (context, destination, now) => {
		PersonalBest.Notes.forEach((frequency, index) => playTone(context, destination, { frequency, seconds: PersonalBest.Seconds, gain: PersonalBest.Gain, type: 'triangle', attackSeconds: 0.01 }, now + index * PersonalBest.Gap));
	},
	record: (context, destination, now) => {
		Fanfare.Notes.forEach((frequency, index) => playTone(context, destination, { frequency, seconds: Fanfare.Seconds, gain: Fanfare.Gain, type: 'triangle', attackSeconds: 0.01 }, now + index * Fanfare.Gap));
		const chordAt = now + Fanfare.Notes.length * Fanfare.Gap;
		Fanfare.Notes.forEach((frequency) => playTone(context, destination, { frequency, seconds: Fanfare.ChordSeconds, gain: Fanfare.ChordGain, attackSeconds: 0.02 }, chordAt));
	},
	rise: (context, destination, now) => {
		playTone(context, destination, { frequency: Rise.From, endFrequency: Rise.To, seconds: Rise.Seconds, gain: Rise.Gain }, now);
		playNoiseBurst(context, destination, { colour: 'white', seconds: Rise.SplashSeconds, gain: Rise.SplashGain, filter: { type: 'lowpass', from: Rise.SplashFrom, to: Rise.SplashTo } }, now);
	}
};

export const FishingSoundNames = Object.keys(Players) as FishingSoundName[];

export function playFishingSound(context: AudioContext, destination: AudioNode, name: FishingSoundName) {
	Players[name](context, destination, context.currentTime);
}
