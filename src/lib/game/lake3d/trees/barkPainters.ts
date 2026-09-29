import type { RandomFraction } from '$lib/domain/random';

export type Grey = (context: CanvasRenderingContext2D, size: number, random: RandomFraction) => void;

const Furrows = { ReferenceSize: 256, Count: 120, Ridges: 50, Wobbles: 3, Wobble: 0.02, Shortest: 0.15, LengthRange: 0.45, Steps: 8, Base: 175, Darkest: 35, DarkRange: 50, Light: 215, Thinnest: 1.5, WidthRange: 5, RidgeOpacity: 0.5, FurrowOpacity: 0.85 } as const;
const Birch = { Lenticels: 70, Patches: 6, Base: 238, PatchWidth: 0.25, PatchHeight: 0.025, MarkWidth: 0.1, MarkHeight: 0.004, PatchLevel: 25, MarkLevel: 55, MarkRange: 50, PatchOpacity: 0.9, MarkOpacity: 0.8 } as const;
const Plates = { Count: 70, Base: 70, Lightest: 200, Range: 60, Width: 0.06, WidthRange: 0.1, Height: 0.1, HeightRange: 0.2 } as const;
const Offsets = [-1, 0, 1];

function grey(level: number, opacity = 1) {
	return `rgba(${level},${level},${level},${opacity})`;
}

function wrapped(size: number, draw: (x: number, y: number) => void) {
	Offsets.forEach((across) => Offsets.forEach((down) => draw(across * size, down * size)));
}

interface Furrow {
	isRidge: boolean;
	x: number;
	y: number;
	length: number;
	phase: number;
	width: number;
	level: number;
}

function wavyLine(context: CanvasRenderingContext2D, size: number, furrow: Furrow, across: number, down: number) {
	context.beginPath();
	for (let step = 0; step <= Furrows.Steps; step++) {
		const y = furrow.y + (furrow.length * size * step) / Furrows.Steps;
		context.lineTo(furrow.x + across + Math.sin((y / size) * Math.PI * 2 * Furrows.Wobbles + furrow.phase) * size * Furrows.Wobble, y + down);
	}
	context.stroke();
}

function furrowAt(index: number, size: number, random: RandomFraction): Furrow {
	const shape = { x: random() * size, y: random() * size, length: Furrows.Shortest + random() * Furrows.LengthRange, phase: random() * Math.PI * 2 };
	return { ...shape, isRidge: index >= Furrows.Count, width: ((Furrows.Thinnest + random() * Furrows.WidthRange) * size) / Furrows.ReferenceSize, level: Furrows.Darkest + random() * Furrows.DarkRange };
}

export const paintFurrows: Grey = (context, size, random) => {
	context.fillStyle = grey(Furrows.Base);
	context.fillRect(0, 0, size, size);
	Array.from({ length: Furrows.Count + Furrows.Ridges }, (_, index) => furrowAt(index, size, random)).forEach((furrow) => {
		context.strokeStyle = furrow.isRidge ? grey(Furrows.Light, Furrows.RidgeOpacity) : grey(furrow.level, Furrows.FurrowOpacity);
		context.lineWidth = furrow.isRidge ? furrow.width / 2 : furrow.width;
		wrapped(size, (across, down) => wavyLine(context, size, furrow, across, down));
	});
};

export const paintBirch: Grey = (context, size, random) => {
	context.fillStyle = grey(Birch.Base);
	context.fillRect(0, 0, size, size);
	for (let mark = 0; mark < Birch.Lenticels + Birch.Patches; mark++) {
		const isPatch = mark >= Birch.Lenticels;
		const x = random() * size;
		const y = random() * size;
		const width = size * (isPatch ? Birch.PatchWidth + random() * Birch.PatchWidth : Birch.MarkWidth + random() * Birch.MarkWidth * 2);
		const height = size * (isPatch ? Birch.PatchHeight + random() * Birch.PatchHeight : Birch.MarkHeight + random() * Birch.MarkHeight);
		context.fillStyle = isPatch ? grey(Birch.PatchLevel, Birch.PatchOpacity) : grey(Birch.MarkLevel + random() * Birch.MarkRange, Birch.MarkOpacity);
		wrapped(size, (across, down) => context.fillRect(x + across, y + down, width, height));
	}
};

export const paintPlates: Grey = (context, size, random) => {
	context.fillStyle = grey(Plates.Base);
	context.fillRect(0, 0, size, size);
	for (let plate = 0; plate < Plates.Count; plate++) {
		const x = random() * size;
		const y = random() * size;
		const width = size * (Plates.Width + random() * Plates.WidthRange);
		const height = size * (Plates.Height + random() * Plates.HeightRange);
		context.fillStyle = grey(Plates.Lightest - random() * Plates.Range);
		wrapped(size, (across, down) => context.fillRect(x + across, y + down, width, height));
	}
};
