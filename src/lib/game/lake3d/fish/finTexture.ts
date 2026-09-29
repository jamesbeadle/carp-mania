import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

const Rays = { Pixels: 64, PerTile: 4, RaysPerMetre: 90, Membrane: '#d6cfc4', Ray: '#ffffff' } as const;

function raysCanvas() {
	const canvas = document.createElement('canvas');
	canvas.width = Rays.Pixels;
	canvas.height = Rays.Pixels;
	const context = canvas.getContext('2d');
	if (!context) return canvas;
	context.fillStyle = Rays.Membrane;
	context.fillRect(0, 0, Rays.Pixels, Rays.Pixels);
	context.fillStyle = Rays.Ray;
	const spacing = Rays.Pixels / Rays.PerTile;
	for (let ray = 0; ray < Rays.PerTile; ray++) context.fillRect(ray * spacing, 0, spacing * 0.35, Rays.Pixels);
	return canvas;
}

export function finRayTexture(turn = 0) {
	const texture = new CanvasTexture(raysCanvas());
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.rotation = turn;
	const repeat = Rays.RaysPerMetre / Rays.PerTile;
	texture.repeat.set(repeat, repeat);
	return texture;
}
