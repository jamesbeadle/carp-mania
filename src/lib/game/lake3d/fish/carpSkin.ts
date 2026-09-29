import { CanvasTexture, Color, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';
import type { CarpStrain } from '$lib/domain/types';
import { FishPalette, type FishColours } from '../../scene/fishPalette';
import { colourOf } from '../cssColour';
import { paintScales, Skin } from './carpScales';

const Belly = { Cream: new Color('#f3e6c2'), Share: 0.45 } as const;
const Bronze = { MidFlank: 0.22, UpperFlank: 0.55 } as const;
const Mottle = { Count: 90, Seed: 23, Shade: 'rgba(40, 30, 12, 0.07)' } as const;
const Gill = { Line: 'rgba(40, 26, 12, 0.55)', Width: 2.5, Flanks: [0.25, 0.75], Reach: 0.17 } as const;

function hexOf(colour: Color) {
	return `#${colour.getHexString()}`;
}

function paintCountershading(context: CanvasRenderingContext2D, colours: FishColours) {
	const flank = colourOf(colours.flank);
	const back = colourOf(colours.back);
	const belly = hexOf(flank.clone().lerp(Belly.Cream, Belly.Share));
	const middle = hexOf(flank.clone().lerp(back, Bronze.MidFlank));
	const upper = hexOf(flank.clone().lerp(back, Bronze.UpperFlank));
	const stops: [number, string][] = [[0, belly], [0.12, belly], [0.24, colours.flank], [0.3, middle], [0.4, upper], [0.5, colours.back], [0.6, upper], [0.7, middle], [0.76, colours.flank], [0.88, belly], [1, belly]];
	const shade = context.createLinearGradient(0, 0, Skin.Width, 0);
	stops.forEach(([at, colour]) => shade.addColorStop(at, colour));
	context.fillStyle = shade;
	context.fillRect(0, 0, Skin.Width, Skin.Height);
}

function paintMottling(context: CanvasRenderingContext2D) {
	const random = seededRandom(Mottle.Seed);
	context.fillStyle = Mottle.Shade;
	for (let index = 0; index < Mottle.Count; index++) {
		context.beginPath();
		context.ellipse(random() * Skin.Width, random() * Skin.Height, 10 + random() * 30, 4 + random() * 10, 0, 0, Math.PI * 2);
		context.fill();
	}
}

function paintHead(context: CanvasRenderingContext2D, colours: FishColours) {
	const headRows = Skin.Height * Skin.HeadShare;
	context.globalAlpha = 0.55;
	context.fillStyle = colours.snout;
	context.fillRect(0, 0, Skin.Width, headRows);
	context.globalAlpha = 1;
	context.strokeStyle = Gill.Line;
	context.lineWidth = Gill.Width;
	Gill.Flanks.forEach((share) => {
		const middle = share * Skin.Width;
		const reach = Gill.Reach * Skin.Width;
		context.beginPath();
		context.moveTo(middle - reach, headRows * 0.8);
		context.quadraticCurveTo(middle, headRows * 1.35, middle + reach, headRows * 0.8);
		context.stroke();
	});
}

export function carpSkinTexture(strain: CarpStrain) {
	const canvas = document.createElement('canvas');
	canvas.width = Skin.Width;
	canvas.height = Skin.Height;
	const context = canvas.getContext('2d');
	const colours = FishPalette[strain];
	if (context) {
		paintCountershading(context, colours);
		paintMottling(context);
		paintScales(context, strain);
		paintHead(context, colours);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
