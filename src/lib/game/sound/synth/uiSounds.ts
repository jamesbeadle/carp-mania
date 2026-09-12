import { playTone } from './tone';

export type UiSoundName = 'tap' | 'confirm' | 'cancel' | 'coins' | 'chime' | 'open' | 'close';

const Tap = { Frequency: 1900, EndFrequency: 1300, Seconds: 0.045, Gain: 0.07 } as const;
const Confirm = { Low: 660, High: 990, Seconds: 0.09, Gap: 0.08, Gain: 0.09 } as const;
const Cancel = { Frequency: 440, EndFrequency: 300, Seconds: 0.13, Gain: 0.08 } as const;
const Coins = { Frequencies: [2400, 2900, 3300], Seconds: 0.12, Gap: 0.05, Gain: 0.06 } as const;
const Chime = { Low: 880, High: 1320, Seconds: 0.6, Gap: 0.12, Gain: 0.07 } as const;
const Sheet = { OpenFrom: 500, OpenTo: 760, CloseFrom: 760, CloseTo: 500, Seconds: 0.1, Gain: 0.05 } as const;

export function playUiSound(context: AudioContext, destination: AudioNode, name: UiSoundName) {
	const now = context.currentTime;
	if (name === 'tap') return playTone(context, destination, { frequency: Tap.Frequency, endFrequency: Tap.EndFrequency, seconds: Tap.Seconds, gain: Tap.Gain });
	if (name === 'cancel') return playTone(context, destination, { frequency: Cancel.Frequency, endFrequency: Cancel.EndFrequency, type: 'triangle', seconds: Cancel.Seconds, gain: Cancel.Gain });
	if (name === 'confirm') return playConfirm(context, destination, now);
	if (name === 'coins') return playCoins(context, destination, now);
	if (name === 'chime') return playChime(context, destination, now);
	if (name === 'open') return playTone(context, destination, { frequency: Sheet.OpenFrom, endFrequency: Sheet.OpenTo, type: 'triangle', seconds: Sheet.Seconds, gain: Sheet.Gain });
	playTone(context, destination, { frequency: Sheet.CloseFrom, endFrequency: Sheet.CloseTo, type: 'triangle', seconds: Sheet.Seconds, gain: Sheet.Gain });
}

function playConfirm(context: AudioContext, destination: AudioNode, now: number) {
	playTone(context, destination, { frequency: Confirm.Low, seconds: Confirm.Seconds, gain: Confirm.Gain, type: 'triangle' }, now);
	playTone(context, destination, { frequency: Confirm.High, seconds: Confirm.Seconds * 1.6, gain: Confirm.Gain, type: 'triangle' }, now + Confirm.Gap);
}

function playCoins(context: AudioContext, destination: AudioNode, now: number) {
	Coins.Frequencies.forEach((frequency, index) => {
		playTone(context, destination, { frequency, endFrequency: frequency * 0.97, type: 'triangle', seconds: Coins.Seconds, gain: Coins.Gain }, now + index * Coins.Gap);
		playTone(context, destination, { frequency: frequency * 2.01, seconds: Coins.Seconds * 0.6, gain: Coins.Gain * 0.4 }, now + index * Coins.Gap);
	});
}

function playChime(context: AudioContext, destination: AudioNode, now: number) {
	playTone(context, destination, { frequency: Chime.Low, seconds: Chime.Seconds, gain: Chime.Gain, attackSeconds: 0.01 }, now);
	playTone(context, destination, { frequency: Chime.High, seconds: Chime.Seconds, gain: Chime.Gain * 0.8, attackSeconds: 0.01 }, now + Chime.Gap);
}
