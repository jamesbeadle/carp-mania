import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, UnsignedByteType } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';

type Grey = (context: CanvasRenderingContext2D, size: number, random: RandomFraction) => void;

const Furrows = { Count: 60, Ridges: 30, Wobbles: 3, Wobble: 0.02, Darkest: 60, DarkRange: 50, Light: 225 } as const;
const Birch = { Lenticels: 90, Patches: 7, Base: 238 } as const;
const Plates = { Count: 70, Base: 70, Lightest: 200 } as const;
const Bark = { Seed: 43, Channels: 4, Opaque: 255, Anisotropy: 4 } as const;
const Offsets = [-1, 0, 1];

function grey(level: number, opacity = 1) {
	return `rgba(${level},${level},${level},${opacity})`;
}

function wrapped(size: number, draw: (x: number, y: number) => void) {
	Offsets.forEach((across) => Offsets.forEach((down) => draw(across * size, down * size)));
}

function wavyLine(context: CanvasRenderingContext2D, size: number, x: number, phase: number) {
	context.beginPath();
	for (let y = 0; y <= size; y += size / 16) context.lineTo(x + Math.sin((y / size) * Math.PI * 2 * Furrows.Wobbles + phase) * size * Furrows.Wobble, y);
	context.stroke();
}

const paintFurrows: Grey = (context, size, random) => {
	context.fillStyle = grey(170);
	context.fillRect(0, 0, size, size);
	const strokes = Array.from({ length: Furrows.Count + Furrows.Ridges }, (_, index) => ({ isRidge: index >= Furrows.Count, x: random() * size, phase: random() * Math.PI * 2, width: 1 + random() * 4, level: Furrows.Darkest + random() * Furrows.DarkRange }));
	strokes.forEach((stroke) => {
		context.strokeStyle = stroke.isRidge ? grey(Furrows.Light, 0.5) : grey(stroke.level, 0.85);
		context.lineWidth = stroke.isRidge ? stroke.width / 2 : stroke.width;
		wrapped(size, (across) => wavyLine(context, size, stroke.x + across, stroke.phase));
	});
};

const paintBirch: Grey = (context, size, random) => {
	context.fillStyle = grey(Birch.Base);
	context.fillRect(0, 0, size, size);
	for (let mark = 0; mark < Birch.Lenticels + Birch.Patches; mark++) {
		const isPatch = mark >= Birch.Lenticels;
		const x = random() * size;
		const y = random() * size;
		const width = size * (isPatch ? 0.15 + random() * 0.2 : 0.03 + random() * 0.08);
		const height = size * (isPatch ? 0.04 + random() * 0.05 : 0.006 + random() * 0.01);
		context.fillStyle = grey(isPatch ? 25 : 55 + random() * 50, isPatch ? 0.9 : 0.8);
		wrapped(size, (across, down) => context.fillRect(x + across, y + down, width, height));
	}
};

const paintPlates: Grey = (context, size, random) => {
	context.fillStyle = grey(Plates.Base);
	context.fillRect(0, 0, size, size);
	for (let plate = 0; plate < Plates.Count; plate++) {
		const x = random() * size;
		const y = random() * size;
		const width = size * (0.06 + random() * 0.1);
		const height = size * (0.1 + random() * 0.2);
		context.fillStyle = grey(Plates.Lightest - random() * 60);
		wrapped(size, (across, down) => context.fillRect(x + across, y + down, width, height));
	}
};

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
