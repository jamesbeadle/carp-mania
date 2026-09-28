import { CanvasTexture, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import { shadeOf } from '../grass/bladeStroke';

const Leaf = { Pixels: 256, Base: '#244a1a', Rim: '#443a1c', Vein: '#4a7a30', Veins: 26, Mottles: 220, Seed: 811 } as const;
const Shades = { Mottle: 0.18, MottleOpacity: 0.55, VeinOpacity: 0.45, RimWidth: 0.08 } as const;

function paintVeins(context: CanvasRenderingContext2D, centre: number) {
	context.strokeStyle = Leaf.Vein;
	context.globalAlpha = Shades.VeinOpacity;
	context.lineWidth = 1.6;
	for (let vein = 0; vein < Leaf.Veins; vein++) {
		const turn = (vein / Leaf.Veins) * Math.PI * 2;
		context.beginPath();
		context.moveTo(centre, centre);
		context.lineTo(centre + Math.cos(turn) * centre, centre + Math.sin(turn) * centre);
		context.stroke();
	}
	context.globalAlpha = 1;
}

function paintMottles(context: CanvasRenderingContext2D, random: () => number) {
	context.globalAlpha = Shades.MottleOpacity;
	for (let mottle = 0; mottle < Leaf.Mottles; mottle++) {
		context.fillStyle = shadeOf(Leaf.Base, (random() - 0.5) * Shades.Mottle * 2);
		context.beginPath();
		context.arc(random() * Leaf.Pixels, random() * Leaf.Pixels, 3 + random() * 9, 0, Math.PI * 2);
		context.fill();
	}
	context.globalAlpha = 1;
}

export function lilyPadTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Leaf.Pixels;
	canvas.height = Leaf.Pixels;
	const context = canvas.getContext('2d');
	const centre = Leaf.Pixels / 2;
	if (context) {
		const rim = context.createRadialGradient(centre, centre, centre * (1 - Shades.RimWidth * 3), centre, centre, centre);
		rim.addColorStop(0, Leaf.Base);
		rim.addColorStop(1, Leaf.Rim);
		context.fillStyle = rim;
		context.fillRect(0, 0, Leaf.Pixels, Leaf.Pixels);
		paintMottles(context, seededRandom(Leaf.Seed));
		paintVeins(context, centre);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
