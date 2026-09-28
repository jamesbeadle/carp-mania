import { DataTexture, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat } from 'three';
import { seededRandom } from '$lib/domain/random';

const Ripples = { Pixels: 256, Waves: 28, Seed: 13, LowestFrequency: 1, HighestFrequency: 14, Steepness: 2.2 } as const;
const ByteMiddle = 127.5;

interface Wave {
	across: number;
	down: number;
	phase: number;
	height: number;
}

function wavesOf(random: () => number): Wave[] {
	return Array.from({ length: Ripples.Waves }, () => {
		const frequency = Ripples.LowestFrequency + Math.floor(random() * (Ripples.HighestFrequency - Ripples.LowestFrequency));
		const angle = random() * Math.PI * 2;
		return { across: Math.round(Math.cos(angle) * frequency), down: Math.round(Math.sin(angle) * frequency), phase: random() * Math.PI * 2, height: 1 / (frequency + 1) };
	});
}

function slopeAt(waves: Wave[], u: number, v: number) {
	return waves.reduce((slope, wave) => {
		const cycle = Math.cos((wave.across * u + wave.down * v) * Math.PI * 2 + wave.phase) * wave.height * Math.PI * 2;
		return { across: slope.across + cycle * wave.across, down: slope.down + cycle * wave.down };
	}, { across: 0, down: 0 });
}

export function rippleNormalTexture() {
	const waves = wavesOf(seededRandom(Ripples.Seed));
	const data = new Uint8Array(Ripples.Pixels * Ripples.Pixels * 4);
	for (let row = 0; row < Ripples.Pixels; row++) {
		for (let column = 0; column < Ripples.Pixels; column++) {
			const slope = slopeAt(waves, column / Ripples.Pixels, row / Ripples.Pixels);
			const length = Math.hypot(slope.across / Ripples.Steepness, slope.down / Ripples.Steepness, Ripples.HighestFrequency);
			const offset = (row * Ripples.Pixels + column) * 4;
			data.set([ByteMiddle - (slope.across / Ripples.Steepness / length) * ByteMiddle, ByteMiddle - (slope.down / Ripples.Steepness / length) * ByteMiddle, (Ripples.HighestFrequency / length) * ByteMiddle + ByteMiddle, 255], offset);
		}
	}
	const texture = new DataTexture(data, Ripples.Pixels, Ripples.Pixels, RGBAFormat);
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.minFilter = LinearMipmapLinearFilter;
	texture.generateMipmaps = true;
	texture.needsUpdate = true;
	return texture;
}
