import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';

export interface Speckling {
	base: string;
	flecks: string[];
	fleckCount: number;
	largestFleck: number;
	metresPerTile: number;
	seed: number;
}

const TilePixels = 256;
const Anisotropy = 8;

function fleckAll(context: CanvasRenderingContext2D, speckling: Speckling) {
	const random = seededRandom(speckling.seed);
	const { flecks } = speckling;
	for (let index = 0; index < speckling.fleckCount; index++) {
		context.fillStyle = flecks[index % flecks.length];
		const size = 1 + random() * speckling.largestFleck;
		context.fillRect(random() * TilePixels, random() * TilePixels, size, size * (0.5 + random()));
	}
}

export function speckledTexture(speckling: Speckling) {
	const canvas = document.createElement('canvas');
	canvas.width = TilePixels;
	canvas.height = TilePixels;
	const context = canvas.getContext('2d');
	if (context) {
		context.fillStyle = speckling.base;
		context.fillRect(0, 0, TilePixels, TilePixels);
		fleckAll(context, speckling);
	}
	const texture = new CanvasTexture(canvas);
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = Anisotropy;
	texture.repeat.set(1 / speckling.metresPerTile, 1 / speckling.metresPerTile);
	return texture;
}
