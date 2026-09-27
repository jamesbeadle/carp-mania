import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';

export const LabelLook = { Font: 'italic 800 44px "Barlow Condensed", "Arial Narrow", sans-serif', Ink: '#f2f7f2', Ground: 'rgba(6, 8, 6, 0.72)', Edge: 'rgba(62, 232, 58, 0.9)', HeightPixels: 64, PaddingPixels: 18, MetresPerPixel: 0.035 } as const;

function paintLabel(context: CanvasRenderingContext2D, words: string, width: number) {
	context.fillStyle = LabelLook.Ground;
	context.beginPath();
	context.roundRect(2, 2, width - 4, LabelLook.HeightPixels - 4, 12);
	context.fill();
	context.strokeStyle = LabelLook.Edge;
	context.lineWidth = 3;
	context.stroke();
	context.fillStyle = LabelLook.Ink;
	context.font = LabelLook.Font;
	context.textBaseline = 'middle';
	context.fillText(words, LabelLook.PaddingPixels, LabelLook.HeightPixels / 2 + 2);
}

export function labelSprite(words: string) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	const upper = words.toUpperCase();
	if (context) context.font = LabelLook.Font;
	const width = Math.ceil((context?.measureText(upper).width ?? 100) + LabelLook.PaddingPixels * 2);
	canvas.width = width;
	canvas.height = LabelLook.HeightPixels;
	if (context) paintLabel(context, upper, width);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	const sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
	sprite.scale.set(width * LabelLook.MetresPerPixel, LabelLook.HeightPixels * LabelLook.MetresPerPixel, 1);
	sprite.renderOrder = 10;
	return sprite;
}
