import { CanvasTexture, Color, Group, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';
import { seededRandom } from '$lib/domain/random';

const Sky = { Count: 26, Seed: 83, LeastDistance: 700, DistanceRange: 1500, LeastHeight: 220, HeightRange: 260, LeastSize: 260, SizeRange: 420, Squash: 0.42 } as const;
const Puff = { Pixels: 256, Blobs: 22 } as const;
const Drift = { MetresPerSecondPerWind: 6, Calmest: 0.6 } as const;
const NightCloud = new Color('#10141b');
const Opacity = { Night: 0.35, Day: 1 } as const;
const White = new Color('#ffffff');
const SunTint = 0.35;

function puffTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Puff.Pixels;
	canvas.height = Puff.Pixels;
	const context = canvas.getContext('2d');
	const random = seededRandom(Sky.Seed);
	for (let index = 0; context && index < Puff.Blobs; index++) {
		const x = Puff.Pixels * (0.25 + random() * 0.5);
		const y = Puff.Pixels * (0.4 + random() * 0.25);
		const radius = Puff.Pixels * (0.08 + random() * 0.14);
		const glow = context.createRadialGradient(x, y, 0, x, y, radius);
		glow.addColorStop(0, 'rgba(255,255,255,0.55)');
		glow.addColorStop(1, 'rgba(255,255,255,0)');
		context.fillStyle = glow;
		context.fillRect(0, 0, Puff.Pixels, Puff.Pixels);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

export class Clouds {
	readonly group = new Group();
	private readonly material = new SpriteMaterial({ map: puffTexture(), fog: false, depthWrite: false, transparent: true });
	private readonly puffs: Sprite[];
	private drift: number = Drift.Calmest;

	constructor() {
		const random = seededRandom(Sky.Seed);
		this.puffs = Array.from({ length: Sky.Count }, () => {
			const puff = new Sprite(this.material);
			const angle = random() * Math.PI * 2;
			const distance = Sky.LeastDistance + random() * Sky.DistanceRange;
			const size = Sky.LeastSize + random() * Sky.SizeRange;
			puff.position.set(Math.cos(angle) * distance, Sky.LeastHeight + random() * Sky.HeightRange, Math.sin(angle) * distance);
			puff.scale.set(size, size * Sky.Squash, 1);
			return puff;
		});
		this.group.add(...this.puffs);
	}

	cover(cloudCover: number, sunColour: Color, daylight: number, windStrength: number) {
		const shown = Math.round(cloudCover * Sky.Count);
		this.puffs.forEach((puff, index) => (puff.visible = index < shown));
		this.material.color.copy(NightCloud).lerp(White.clone().lerp(sunColour, SunTint), daylight);
		this.material.opacity = Opacity.Night + (Opacity.Day - Opacity.Night) * daylight;
		this.drift = Drift.Calmest + windStrength * Drift.MetresPerSecondPerWind;
	}

	advance(secondsElapsed: number) {
		this.group.rotateY((this.drift * secondsElapsed) / Sky.LeastDistance);
	}
}
