import { CanvasTexture, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import { shadeOf } from '../grass/bladeStroke';

const Leaf = { Pixels: 256, Base: '#22421a', Heart: '#2e5222', Rim: '#3c3a1e', Vein: '#3e6428', Veins: 15, Seed: 811 } as const;
const Shades = { VeinOpacity: 0.22, VeinWidth: 1.2, VeinBend: 0.12, RimFrom: 0.93, Streaks: 40, StreakOpacity: 0.12, StreakShade: 0.1, StreakThinnest: 2, StreakSwing: 6 } as const;

function paintVeins(context: CanvasRenderingContext2D, centre: number, random: () => number) {
	context.strokeStyle = Leaf.Vein;
	context.globalAlpha = Shades.VeinOpacity;
	context.lineWidth = Shades.VeinWidth;
	for (let vein = 0; vein < Leaf.Veins; vein++) {
		const turn = ((vein + random() / 2) / Leaf.Veins) * Math.PI * 2;
		const bend = turn + (random() - 1 / 2) * Shades.VeinBend * 2;
		context.beginPath();
		context.moveTo(centre, centre);
		context.quadraticCurveTo(centre + (Math.cos(bend) * centre) / 2, centre + (Math.sin(bend) * centre) / 2, centre + Math.cos(turn) * centre, centre + Math.sin(turn) * centre);
		context.stroke();
	}
	context.globalAlpha = 1;
}

function paintStreaks(context: CanvasRenderingContext2D, centre: number, random: () => number) {
	context.globalAlpha = Shades.StreakOpacity;
	for (let streak = 0; streak < Shades.Streaks; streak++) {
		const turn = random() * Math.PI * 2;
		context.strokeStyle = shadeOf(Leaf.Base, (random() - 1 / 2) * Shades.StreakShade * 2);
		context.lineWidth = Shades.StreakThinnest + random() * Shades.StreakSwing;
		context.beginPath();
		context.arc(centre, centre, random() * centre, turn, turn + random());
		context.stroke();
	}
	context.globalAlpha = 1;
}

function paintSurface(context: CanvasRenderingContext2D, centre: number) {
	const surface = context.createRadialGradient(centre, centre, 0, centre, centre, centre);
	surface.addColorStop(0, Leaf.Heart);
	surface.addColorStop(Shades.RimFrom, Leaf.Base);
	surface.addColorStop(1, Leaf.Rim);
	context.fillStyle = surface;
	context.fillRect(0, 0, Leaf.Pixels, Leaf.Pixels);
}

export function lilyPadTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Leaf.Pixels;
	canvas.height = Leaf.Pixels;
	const context = canvas.getContext('2d');
	const centre = Leaf.Pixels / 2;
	const random = seededRandom(Leaf.Seed);
	if (context) {
		paintSurface(context, centre);
		paintStreaks(context, centre, random);
		paintVeins(context, centre, random);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
