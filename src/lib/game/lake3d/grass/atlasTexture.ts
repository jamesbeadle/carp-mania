import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, SRGBColorSpace, UnsignedByteType } from 'three';

export interface AtlasGrid {
	columns: number;
	rows: number;
	cellWidth: number;
	cellHeight: number;
	padding: number;
}

export type CellPainter = (context: CanvasRenderingContext2D, cellIndex: number) => void;

const Channels = 4;
const Opaque = { Alpha: 3, Solid: 128, SeeThrough: 8 } as const;
const MipmappedSurface = { generateMipmaps: true, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter, colorSpace: SRGBColorSpace, anisotropy: 4 };

function averageSolidColour(pixels: Uint8ClampedArray, indices: number[]) {
	const solid = indices.filter((index) => pixels[index + Opaque.Alpha] > Opaque.Solid);
	const total = [0, 1, 2].map((channel) => solid.reduce((sum, index) => sum + pixels[index + channel], 0));
	return total.map((sum) => sum / Math.max(1, solid.length));
}

function bleedCell(pixels: Uint8ClampedArray, grid: AtlasGrid, column: number, row: number) {
	const width = grid.columns * grid.cellWidth;
	const indices: number[] = [];
	for (let y = row * grid.cellHeight; y < (row + 1) * grid.cellHeight; y++) {
		for (let x = column * grid.cellWidth; x < (column + 1) * grid.cellWidth; x++) indices.push((y * width + x) * Channels);
	}
	const average = averageSolidColour(pixels, indices);
	const clearPixels = indices.filter((index) => pixels[index + Opaque.Alpha] < Opaque.SeeThrough);
	clearPixels.forEach((index) => pixels.set(average, index));
}

function flippedRows(pixels: Uint8ClampedArray, width: number, height: number) {
	const flipped = new Uint8Array(pixels.length);
	const rowLength = width * Channels;
	for (let row = 0; row < height; row++) flipped.set(pixels.subarray(row * rowLength, (row + 1) * rowLength), (height - 1 - row) * rowLength);
	return flipped;
}

function paintCells(context: CanvasRenderingContext2D, grid: AtlasGrid, painter: CellPainter) {
	const inset = { x: grid.cellWidth * grid.padding, y: grid.cellHeight * grid.padding };
	for (let cellIndex = 0; cellIndex < grid.columns * grid.rows; cellIndex++) {
		const origin = { x: (cellIndex % grid.columns) * grid.cellWidth, y: Math.floor(cellIndex / grid.columns) * grid.cellHeight };
		context.save();
		context.beginPath();
		context.rect(origin.x + inset.x, origin.y + inset.y, grid.cellWidth - inset.x * 2, grid.cellHeight - inset.y * 2);
		context.clip();
		context.translate(origin.x + inset.x, origin.y + inset.y);
		context.scale(1 - grid.padding * 2, 1 - grid.padding * 2);
		painter(context, cellIndex);
		context.restore();
	}
}

function emptyTexture() {
	return new DataTexture(new Uint8Array(Channels), 1, 1);
}

export function paintAtlas(grid: AtlasGrid, painter: CellPainter) {
	const width = grid.columns * grid.cellWidth;
	const height = grid.rows * grid.cellHeight;
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) return emptyTexture();
	paintCells(context, grid, painter);
	const image = context.getImageData(0, 0, width, height);
	for (let cellIndex = 0; cellIndex < grid.columns * grid.rows; cellIndex++) {
		bleedCell(image.data, grid, cellIndex % grid.columns, Math.floor(cellIndex / grid.columns));
	}
	const texture = new DataTexture(flippedRows(image.data, width, height), width, height, RGBAFormat, UnsignedByteType);
	return Object.assign(texture, MipmappedSurface, { needsUpdate: true });
}
