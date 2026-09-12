import { Ambience } from './ambience/ambience';
import type { AmbientScene } from './ambience/ambientScene';
import { playSound, type SoundName } from './soundLibrary';
import { clampVolume, loadSoundSettings, saveSoundSettings } from './soundSettings';

const Levels = { Effects: 0.9, Ambience: 1 } as const;

export class SoundEngine {
	isMuted = $state(false);
	volume = $state(0.7);
	isUnlocked = $state(false);
	private context: AudioContext | null = null;
	private master: GainNode | null = null;
	private effects: GainNode | null = null;
	private ambienceBus: GainNode | null = null;
	private ambience: Ambience | null = null;
	private wantedScene: AmbientScene | null = null;

	constructor() {
		if (typeof window === 'undefined') return;
		const settings = loadSoundSettings();
		this.isMuted = settings.isMuted;
		this.volume = settings.volume;
	}

	unlock() {
		if (this.context) return this.resumeIfSuspended();
		if (typeof AudioContext === 'undefined') return;
		this.context = new AudioContext();
		this.master = this.context.createGain();
		this.effects = this.context.createGain();
		this.ambienceBus = this.context.createGain();
		this.effects.gain.value = Levels.Effects;
		this.ambienceBus.gain.value = Levels.Ambience;
		this.effects.connect(this.master);
		this.ambienceBus.connect(this.master);
		this.master.connect(this.context.destination);
		this.applyLevels();
		this.isUnlocked = true;
		if (this.wantedScene) this.startAmbience(this.wantedScene);
	}

	play(name: SoundName) {
		if (!this.context || !this.effects || this.isMuted) return;
		playSound(this.context, this.effects, name);
	}

	startAmbience(scene: AmbientScene) {
		this.wantedScene = scene;
		if (!this.context || !this.ambienceBus) return;
		this.ambience ??= new Ambience(this.context, this.ambienceBus);
		this.ambience.update(scene);
	}

	stopAmbience() {
		this.wantedScene = null;
		this.ambience?.stop();
		this.ambience = null;
	}

	toggleMute() {
		this.isMuted = !this.isMuted;
		this.remember();
	}

	setVolume(volume: number) {
		this.volume = clampVolume(volume);
		this.remember();
	}

	private resumeIfSuspended() {
		if (this.context?.state === 'suspended') this.context.resume();
	}

	private remember() {
		this.applyLevels();
		saveSoundSettings({ isMuted: this.isMuted, volume: this.volume });
	}

	private applyLevels() {
		if (!this.master || !this.context) return;
		this.master.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.context.currentTime, 0.05);
	}
}

export const sound = new SoundEngine();
