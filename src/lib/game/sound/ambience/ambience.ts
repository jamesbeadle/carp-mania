import type { AmbientLayer } from './ambientLayer';
import type { AmbientScene } from './ambientScene';
import { startBirdsong, type BirdsongLayer } from './birdsong';
import { startRain } from './rain';
import { startWaterLap } from './waterLap';
import { startWind } from './wind';

const FadeSeconds = { In: 2.5, Out: 1.2 } as const;

export class Ambience {
	private readonly bus: GainNode;
	private readonly water: AmbientLayer;
	private readonly wind: AmbientLayer;
	private readonly rain: AmbientLayer;
	private readonly birds: BirdsongLayer;

	constructor(private readonly context: AudioContext, destination: AudioNode) {
		this.bus = context.createGain();
		this.bus.gain.setValueAtTime(0, context.currentTime);
		this.bus.gain.linearRampToValueAtTime(1, context.currentTime + FadeSeconds.In);
		this.bus.connect(destination);
		this.water = startWaterLap(context, this.bus);
		this.wind = startWind(context, this.bus);
		this.rain = startRain(context, this.bus);
		this.birds = startBirdsong(context, this.bus);
	}

	update(scene: AmbientScene) {
		this.water.setLevel(scene.water);
		this.wind.setLevel(scene.wind);
		this.rain.setLevel(scene.rain);
		this.birds.setLevel(scene.birdDensity);
		this.birds.setNight(scene.isNight);
	}

	stop() {
		const now = this.context.currentTime;
		this.bus.gain.cancelScheduledValues(now);
		this.bus.gain.setValueAtTime(this.bus.gain.value, now);
		this.bus.gain.linearRampToValueAtTime(0, now + FadeSeconds.Out);
		this.birds.stop();
		setTimeout(() => {
			[this.water, this.wind, this.rain].forEach((layer) => layer.stop());
			this.bus.disconnect();
		}, FadeSeconds.Out * 1000);
	}
}
