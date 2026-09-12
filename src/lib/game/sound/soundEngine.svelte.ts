import { Ambience } from './ambience/ambience';
import type { AmbientScene } from './ambience/ambientScene';
import { startSoundLoop } from './loopPlayer';
import { buildSoundGraph, type SoundGraph } from './soundGraph';
import { playSound, type SoundName } from './soundLibrary';
import { clampVolume, loadSoundSettings, saveSoundSettings } from './soundSettings';
import type { LoopName, SoundLoop } from './synth/loops';

export class SoundEngine {
	isMuted = $state(false);
	volume = $state(0.7);
	isUnlocked = $state(false);
	private context: AudioContext | null = null;
	private graph: SoundGraph | null = null;
	private ambience: Ambience | null = null;
	private wantedScene: AmbientScene | null = null;
	private loops = new Map<LoopName, SoundLoop>();

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
		this.graph = buildSoundGraph(this.context);
		this.applyLevels();
		this.isUnlocked = true;
		if (this.wantedScene) this.startAmbience(this.wantedScene);
	}

	play(name: SoundName) {
		if (!this.context || !this.graph || this.isMuted) return;
		playSound(this.context, this.graph.effects, name);
	}

	startLoop(name: LoopName) {
		if (!this.context || !this.graph || this.loops.has(name)) return;
		this.loops.set(name, startSoundLoop(this.context, this.graph.effects, name));
	}

	stopLoop(name: LoopName) {
		this.loops.get(name)?.stop();
		this.loops.delete(name);
	}

	stopLoops() {
		for (const name of [...this.loops.keys()]) this.stopLoop(name);
	}

	startAmbience(scene: AmbientScene) {
		this.wantedScene = scene;
		if (!this.context || !this.graph) return;
		this.ambience ??= new Ambience(this.context, this.graph.ambienceBus);
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
		if (!this.graph || !this.context) return;
		this.graph.master.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.context.currentTime, 0.05);
	}
}

export const sound = new SoundEngine();
