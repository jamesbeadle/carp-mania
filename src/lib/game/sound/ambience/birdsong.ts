import type { AmbientLayer } from './ambientLayer';
import { owlHoot, singPhrase, Songbirds } from './birdSpecies';

const Chorus = { ShortestGapSeconds: 5, LongestGapSeconds: 20, QuietCheckSeconds: 6 } as const;
const Owl = { ShortestGapSeconds: 18, LongestGapSeconds: 45, Gain: 0.05 } as const;
const Pan = { Spread: 0.8 } as const;

export interface BirdsongLayer extends AmbientLayer {
	setNight(isNight: boolean): void;
}

export function startBirdsong(context: AudioContext, destination: AudioNode): BirdsongLayer {
	let density = 0;
	let isNight = false;
	let timer: ReturnType<typeof setTimeout> | null = null;

	const schedule = (seconds: number) => {
		timer = setTimeout(sing, seconds * 1000);
	};

	function sing() {
		if (isNight) return hoot();
		if (density <= 0) return schedule(Chorus.QuietCheckSeconds);
		const species = Songbirds[Math.floor(Math.random() * Songbirds.length)];
		const phraseSeconds = singPhrase(context, destination, species(Math.random), (Math.random() * 2 - 1) * Pan.Spread, Math.random);
		const gap = Chorus.ShortestGapSeconds + (Chorus.LongestGapSeconds - Chorus.ShortestGapSeconds) * (1 - density) * Math.random();
		schedule(phraseSeconds + gap);
	}

	function hoot() {
		const owl = context.createGain();
		owl.gain.value = Owl.Gain;
		owl.connect(destination);
		singPhrase(context, owl, owlHoot(), (Math.random() * 2 - 1) * Pan.Spread, () => 0.5);
		schedule(Owl.ShortestGapSeconds + Math.random() * (Owl.LongestGapSeconds - Owl.ShortestGapSeconds));
	}

	schedule(Chorus.ShortestGapSeconds);
	return {
		setLevel: (amount) => (density = amount),
		setNight: (night) => (isNight = night),
		stop: () => {
			if (timer) clearTimeout(timer);
		}
	};
}
