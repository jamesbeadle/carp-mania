const Levels = { Effects: 0.9, Ambience: 1 } as const;

export interface SoundGraph {
	master: GainNode;
	effects: GainNode;
	ambienceBus: GainNode;
}

export function buildSoundGraph(context: AudioContext): SoundGraph {
	const master = context.createGain();
	const effects = context.createGain();
	const ambienceBus = context.createGain();
	effects.gain.value = Levels.Effects;
	ambienceBus.gain.value = Levels.Ambience;
	effects.connect(master);
	ambienceBus.connect(master);
	master.connect(context.destination);
	return { master, effects, ambienceBus };
}
