import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, SRGBColorSpace, UnsignedByteType } from 'three';
import { seededRandom, type RandomFraction } from '$lib/domain/random';
import { AtlasPainter, type PixelRegion } from './atlasPainter';
import { AtlasGrid, AtlasRegions, type AtlasRegion, type FoliageRegion } from './atlasRegions';
import { paintBirch, paintFineBirch } from './birchPainter';
import { paintBroadleaf, paintFineBroadleaf, paintFineRoundleaf, paintRoundleaf } from './leafPainters';
import { paintNeedles, paintSpray, paintWillow } from './stripPainters';
import { paintTwigs } from './twigPainter';
import { mipLevelsOf } from './atlasMipmaps';

export { AtlasRegions, type AtlasRegion, type FoliageRegion } from './atlasRegions';

type Painting = (painter: AtlasPainter, region: PixelRegion, random: RandomFraction) => void;
const Paintings: Record<FoliageRegion, Painting> = {
	broadleaf: paintBroadleaf,
	broadleafFine: paintFineBroadleaf,
	roundleaf: paintRoundleaf,
	roundleafFine: paintFineRoundleaf,
	birch: paintBirch,
	birchFine: paintFineBirch,
	willow: paintWillow,
	needles: paintNeedles,
	spray: paintSpray,
	twigs: paintTwigs
};
const Atlas = { Seed: 71, Backdrop: '#a9b596', Anisotropy: 4 } as const;
const Channels = 4;

interface AtlasSize {
	width: number;
	height: number;
}

function canvasOf(size: AtlasSize) {
	const canvas = document.createElement('canvas');
	Object.assign(canvas, size);
	return canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
}

function pixelRegionOf(region: AtlasRegion, size: AtlasSize): PixelRegion {
	return { left: region.x * size.width, top: region.y * size.height, width: region.width * size.width, height: region.height * size.height };
}

function combine(colour: CanvasRenderingContext2D, mask: CanvasRenderingContext2D, size: AtlasSize) {
	const colours = colour.getImageData(0, 0, size.width, size.height).data;
	const coverage = mask.getImageData(0, 0, size.width, size.height).data;
	const data = new Uint8Array(colours.length);
	for (let index = 0; index < data.length; index += Channels) {
		data.set(colours.subarray(index, index + Channels - 1), index);
		data[index + Channels - 1] = coverage[index];
	}
	return data;
}

function paintAll(colour: CanvasRenderingContext2D, mask: CanvasRenderingContext2D, size: AtlasSize) {
	colour.fillStyle = Atlas.Backdrop;
	colour.fillRect(0, 0, size.width, size.height);
	mask.fillStyle = 'black';
	mask.fillRect(0, 0, size.width, size.height);
	const painter = new AtlasPainter(colour, mask);
	const random = seededRandom(Atlas.Seed);
	(Object.keys(Paintings) as FoliageRegion[]).forEach((name) => AtlasRegions[name].forEach((region) => painter.within(pixelRegionOf(region, size), (pixelRegion) => Paintings[name](painter, pixelRegion, random))));
}

export function foliageAtlas(pixelsWide: number) {
	const size = { width: pixelsWide, height: (pixelsWide * AtlasGrid.Rows) / AtlasGrid.Columns };
	const colour = canvasOf(size);
	const mask = canvasOf(size);
	paintAll(colour, mask, size);
	const data = combine(colour, mask, size);
	const texture = new DataTexture(data, size.width, size.height, RGBAFormat, UnsignedByteType);
	Object.assign(texture, { mipmaps: mipLevelsOf(data, size), colorSpace: SRGBColorSpace, generateMipmaps: false, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter, anisotropy: Atlas.Anisotropy, needsUpdate: true });
	return texture;
}
