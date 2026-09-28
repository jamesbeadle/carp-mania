import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '$lib/domain/random';

export type Finish = 'boards' | 'render' | 'tiles' | 'gravel';

const Pixels = 256;
const MetresPerTile: Record<Finish, number> = { boards: 2, render: 3, tiles: 1.6, gravel: 2 };
const Board = { Rows: 12, Gap: 3 } as const;
const Tile = { Rows: 10, Columns: 8 } as const;
const Speckle = { Count: 2500, Seed: 37 } as const;

function speckle(context: CanvasRenderingContext2D, light: number, spread: number) {
	const random = seededRandom(Speckle.Seed);
	context.fillStyle = `rgb(${light},${light},${light})`;
	context.fillRect(0, 0, Pixels, Pixels);
	for (let index = 0; index < Speckle.Count; index++) {
		const shade = Math.round(light + (random() - 0.5) * spread);
		context.fillStyle = `rgb(${shade},${shade},${shade})`;
		context.fillRect(random() * Pixels, random() * Pixels, 1 + random() * 2, 1 + random() * 2);
	}
}

function boards(context: CanvasRenderingContext2D) {
	speckle(context, 225, 40);
	const rowHeight = Pixels / Board.Rows;
	context.fillStyle = 'rgba(40, 30, 20, 0.55)';
	for (let row = 1; row <= Board.Rows; row++) context.fillRect(0, row * rowHeight - Board.Gap, Pixels, Board.Gap);
	context.fillStyle = 'rgba(255, 255, 255, 0.18)';
	for (let row = 0; row < Board.Rows; row++) context.fillRect(0, row * rowHeight, Pixels, 2);
}

function tiles(context: CanvasRenderingContext2D) {
	speckle(context, 215, 50);
	const rowHeight = Pixels / Tile.Rows;
	const width = Pixels / Tile.Columns;
	context.strokeStyle = 'rgba(20, 20, 20, 0.5)';
	context.lineWidth = 2;
	for (let row = 0; row < Tile.Rows; row++) {
		const offset = (row % 2) * (width / 2);
		context.beginPath();
		context.moveTo(0, row * rowHeight);
		context.lineTo(Pixels, row * rowHeight);
		for (let column = 0; column <= Tile.Columns; column++) context.moveTo(column * width + offset, row * rowHeight), context.lineTo(column * width + offset, (row + 1) * rowHeight);
		context.stroke();
	}
}

const Painters: Record<Finish, (context: CanvasRenderingContext2D) => void> = { boards, tiles, render: (context) => speckle(context, 236, 14), gravel: (context) => speckle(context, 200, 110) };

export function finishTexture(finish: Finish) {
	const canvas = document.createElement('canvas');
	canvas.width = Pixels;
	canvas.height = Pixels;
	const context = canvas.getContext('2d');
	if (context) Painters[finish](context);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(1 / MetresPerTile[finish], 1 / MetresPerTile[finish]);
	return texture;
}
