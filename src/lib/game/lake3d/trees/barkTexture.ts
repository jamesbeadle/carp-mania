import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, UnsignedByteType } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import { paintBirch, paintFurrows, paintPlates, type Grey } from './barkPainters';

const Bark = { Seed: 43, Channels: 4, Opaque: 255, Anisotropy: 4 } as const;

function greyChannel(paint: Grey, size: number, random: RandomFraction) {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
	paint(context, size, random);
	return context.getImageData(0, 0, size, size).data;
}

export function barkTexture(size: number) {
	const random = seededRandom(Bark.Seed);
	const channels = [paintFurrows, paintBirch, paintPlates].map((paint) => greyChannel(paint, size, random));
	const data = new Uint8Array(size * size * Bark.Channels);
	for (let index = 0; index < data.length; index += Bark.Channels) {
		channels.forEach((channel, offset) => (data[index + offset] = channel[index]));
		data[index + Bark.Channels - 1] = Bark.Opaque;
	}
	const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
	Object.assign(texture, { wrapS: RepeatWrapping, wrapT: RepeatWrapping, generateMipmaps: true, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter, anisotropy: Bark.Anisotropy, needsUpdate: true });
	return texture;
}
