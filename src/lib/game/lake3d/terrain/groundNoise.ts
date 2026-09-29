import { DataTexture, LinearMipmapLinearFilter, LinearFilter, RepeatWrapping, RGBAFormat } from 'three';
import { tileableNoise } from './tileNoise';

const Pixels = 256;
const ByteMost = 255;
const Channels = [
	{ cells: 4, octaves: 5, seed: 101 },
	{ cells: 8, octaves: 4, seed: 202 },
	{ cells: 16, octaves: 3, seed: 303 },
	{ cells: 6, octaves: 5, seed: 404 }
];
const Contrast = { Middle: 0.5, Stretch: 1.8 } as const;

function stretched(value: number) {
	return Math.min(1, Math.max(0, (value - Contrast.Middle) * Contrast.Stretch + Contrast.Middle));
}

export function groundNoiseTexture() {
	const layers = Channels.map((channel) => tileableNoise({ pixels: Pixels, ...channel }));
	const data = new Uint8Array(Pixels * Pixels * 4);
	for (let pixel = 0; pixel < Pixels * Pixels; pixel++) {
		layers.forEach((layer, channel) => (data[pixel * 4 + channel] = Math.round(stretched(layer[pixel]) * ByteMost)));
	}
	const texture = new DataTexture(data, Pixels, Pixels, RGBAFormat);
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.magFilter = LinearFilter;
	texture.minFilter = LinearMipmapLinearFilter;
	texture.generateMipmaps = true;
	texture.needsUpdate = true;
	return texture;
}
