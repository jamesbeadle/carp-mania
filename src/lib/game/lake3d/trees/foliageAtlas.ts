import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, SRGBColorSpace, UnsignedByteType } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import { AtlasPainter, type PixelRegion } from './atlasPainter';
import { paintBirch, paintBroadleaf } from './leafPainters';
import { paintNeedles, paintSpray, paintWillow } from './stripPainters';
import { paintTwigs } from './twigPainter';
import { mipLevelsOf } from './atlasMipmaps';

export interface AtlasRegion {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type FoliageRegion = 'broadleaf' | 'willow' | 'birch' | 'needles' | 'spray' | 'twigs';

export const AtlasRegions: Record<FoliageRegion, AtlasRegion> = {
	broadleaf: { x: 0, y: 0, width: 0.5, height: 0.5 },
	willow: { x: 0.5, y: 0, width: 0.25, height: 0.5 },
	birch: { x: 0.75, y: 0, width: 0.25, height: 0.25 },
	needles: { x: 0.75, y: 0.25, width: 0.25, height: 0.25 },
	spray: { x: 0, y: 0.5, width: 0.25, height: 0.5 },
	twigs: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }
};

type Painting = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => void;
const Paintings: Record<FoliageRegion, Painting> = { broadleaf: paintBroadleaf, willow: paintWillow, birch: paintBirch, needles: paintNeedles, spray: paintSpray, twigs: paintTwigs };
const Atlas = { Seed: 71, Backdrop: '#a9b596', Anisotropy: 4 } as const;
const Channels = 4;

function canvasOf(pixels: number) {
	const canvas = document.createElement('canvas');
	canvas.width = pixels;
	canvas.height = pixels;
	return canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
}

function pixelRegionOf(region: AtlasRegion, pixels: number): PixelRegion {
	return { left: region.x * pixels, top: region.y * pixels, width: region.width * pixels, height: region.height * pixels };
}

function combine(colour: CanvasRenderingContext2D, mask: CanvasRenderingContext2D, pixels: number) {
	const colours = colour.getImageData(0, 0, pixels, pixels).data;
	const coverage = mask.getImageData(0, 0, pixels, pixels).data;
	const data = new Uint8Array(colours.length);
	for (let index = 0; index < data.length; index += Channels) {
		data.set(colours.subarray(index, index + Channels - 1), index);
		data[index + Channels - 1] = coverage[index];
	}
	return data;
}

export function foliageAtlas(pixels: number) {
	const colour = canvasOf(pixels);
	const mask = canvasOf(pixels);
	colour.fillStyle = Atlas.Backdrop;
	colour.fillRect(0, 0, pixels, pixels);
	mask.fillStyle = 'black';
	mask.fillRect(0, 0, pixels, pixels);
	const painter = new AtlasPainter(colour, mask);
	const random = seededRandom(Atlas.Seed);
	(Object.keys(Paintings) as FoliageRegion[]).forEach((name) => Paintings[name](painter, pixelRegionOf(AtlasRegions[name], pixels), random));
	const data = combine(colour, mask, pixels);
	const texture = new DataTexture(data, pixels, pixels, RGBAFormat, UnsignedByteType);
	Object.assign(texture, { mipmaps: mipLevelsOf(data, pixels), colorSpace: SRGBColorSpace, generateMipmaps: false, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter, anisotropy: Atlas.Anisotropy, needsUpdate: true });
	return texture;
}
