import { CanvasTexture, SRGBColorSpace } from 'three';
import type { CarpStrain } from '$lib/domain/types';
import { FishPalette } from '../../scene/fishPalette';
import { paintScales, Skin } from './carpScales';

function paintFlankShading(context: CanvasRenderingContext2D, strain: CarpStrain) {
	const colours = FishPalette[strain];
	const shade = context.createLinearGradient(0, 0, Skin.Width, 0);
	shade.addColorStop(0, colours.flank);
	shade.addColorStop(0.3, colours.flank);
	shade.addColorStop(0.5, colours.back);
	shade.addColorStop(0.7, colours.flank);
	shade.addColorStop(1, colours.flank);
	context.fillStyle = shade;
	context.fillRect(0, 0, Skin.Width, Skin.Height);
}

function paintHead(context: CanvasRenderingContext2D, strain: CarpStrain) {
	const colours = FishPalette[strain];
	const headRows = Skin.Height * Skin.HeadShare;
	context.globalAlpha = 0.55;
	context.fillStyle = colours.snout;
	context.fillRect(0, 0, Skin.Width, headRows);
	context.globalAlpha = 1;
	context.strokeStyle = colours.ridge;
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(0, headRows);
	context.bezierCurveTo(Skin.Width * 0.25, headRows * 1.25, Skin.Width * 0.75, headRows * 1.25, Skin.Width, headRows);
	context.stroke();
}

export function carpSkinTexture(strain: CarpStrain) {
	const canvas = document.createElement('canvas');
	canvas.width = Skin.Width;
	canvas.height = Skin.Height;
	const context = canvas.getContext('2d');
	if (context) {
		paintFlankShading(context, strain);
		paintScales(context, strain);
		paintHead(context, strain);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
