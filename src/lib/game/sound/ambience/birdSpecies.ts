import { playTone } from '../synth/tone';

export interface Note {
	frequency: number;
	endFrequency: number;
	seconds: number;
	gapSeconds: number;
}

export type Species = (random: () => number) => Note[];

const Distance = { QuietestGain: 0.05, LoudestGain: 0.11 } as const;

export const Songbirds: Species[] = [robin, blackbird, chiffchaff, wren, greatTit];

export function singPhrase(context: AudioContext, destination: AudioNode, notes: Note[], pan: number, random: () => number) {
	const gain = Distance.QuietestGain + random() * (Distance.LoudestGain - Distance.QuietestGain);
	let when = context.currentTime;
	for (const note of notes) {
		playTone(context, destination, { frequency: note.frequency, endFrequency: note.endFrequency, seconds: note.seconds, gain, pan, attackSeconds: 0.008 }, when);
		when += note.seconds + note.gapSeconds;
	}
	return when - context.currentTime;
}

function robin(random: () => number): Note[] {
	const count = 5 + Math.floor(random() * 4);
	return Array.from({ length: count }, (_, index) => {
		const frequency = 3300 - index * 140 + (random() - 0.5) * 400;
		return { frequency, endFrequency: frequency * (0.85 + random() * 0.3), seconds: 0.06 + random() * 0.05, gapSeconds: 0.04 + random() * 0.05 };
	});
}

function blackbird(random: () => number): Note[] {
	const count = 3 + Math.floor(random() * 3);
	return Array.from({ length: count }, () => {
		const frequency = 1700 + random() * 900;
		return { frequency, endFrequency: frequency * (0.92 + random() * 0.16), seconds: 0.12 + random() * 0.09, gapSeconds: 0.06 + random() * 0.08 };
	});
}

function chiffchaff(random: () => number): Note[] {
	const count = 4 + Math.floor(random() * 5);
	return Array.from({ length: count }, (_, index) => ({ frequency: index % 2 === 0 ? 3600 : 3100, endFrequency: index % 2 === 0 ? 3500 : 3000, seconds: 0.07, gapSeconds: 0.09 }));
}

function wren(random: () => number): Note[] {
	const count = 12 + Math.floor(random() * 7);
	return Array.from({ length: count }, (_, index) => ({ frequency: 4200 - index * 20, endFrequency: 3900 - index * 20, seconds: 0.035, gapSeconds: 0.02 }));
}

function greatTit(): Note[] {
	const pair = [
		{ frequency: 4000, endFrequency: 3900, seconds: 0.09, gapSeconds: 0.04 },
		{ frequency: 3000, endFrequency: 2900, seconds: 0.11, gapSeconds: 0.12 }
	];
	return [...pair, ...pair, ...pair];
}

export function owlHoot(): Note[] {
	return [
		{ frequency: 380, endFrequency: 360, seconds: 0.28, gapSeconds: 0.2 },
		{ frequency: 350, endFrequency: 320, seconds: 0.5, gapSeconds: 0 }
	];
}
