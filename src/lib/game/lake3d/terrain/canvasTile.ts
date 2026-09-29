import { CanvasTexture, Color, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace, type RGB } from 'three';

export type Painter = (context: CanvasRenderingContext2D, pixels: number) => void;

const Anisotropy = 8;
const ByteMost = 255;

export function paintedTile(pixels: number, paint: Painter) {
	const canvas = document.createElement('canvas');
	canvas.width = pixels;
	canvas.height = pixels;
	const context = canvas.getContext('2d');
	if (context) paint(context, pixels);
	const texture = new CanvasTexture(canvas);
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.colorSpace = SRGBColorSpace;
	texture.minFilter = LinearMipmapLinearFilter;
	texture.anisotropy = Anisotropy;
	return texture;
}

export function aroundTheSeams(pixels: number, x: number, y: number, reach: number, draw: (x: number, y: number) => void) {
	const acrossShifts = [0, ...(x < reach ? [pixels] : []), ...(x > pixels - reach ? [-pixels] : [])];
	const downShifts = [0, ...(y < reach ? [pixels] : []), ...(y > pixels - reach ? [-pixels] : [])];
	acrossShifts.forEach((across) => downShifts.forEach((down) => draw(x + across, y + down)));
}

export function fillFromNoise(context: CanvasRenderingContext2D, pixels: number, noise: Float32Array, low: string, high: string) {
	const image = context.createImageData(pixels, pixels);
	const from = new Color(low);
	const to = new Color(high);
	const mixed = new Color();
	const bytes: RGB = { r: 0, g: 0, b: 0 };
	for (let pixel = 0; pixel < noise.length; pixel++) {
		mixed.copy(from).lerp(to, noise[pixel]).getRGB(bytes, SRGBColorSpace);
		image.data.set([bytes.r * ByteMost, bytes.g * ByteMost, bytes.b * ByteMost, ByteMost], pixel * 4);
	}
	context.putImageData(image, 0, 0);
}

export function shadeOf(hex: string, lightness: number) {
	const colour = new Color(hex).multiplyScalar(lightness);
	return `#${colour.getHexString()}`;
}
