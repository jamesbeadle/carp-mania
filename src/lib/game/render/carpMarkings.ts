import type { CarpStrain } from '$lib/domain/types';
import type { FishProportions } from './carpOutline';

export function drawStrainMarkings(context: CanvasRenderingContext2D, strain: CarpStrain, proportions: FishProportions, scale: string, patch: string) {
	if (strain === 'common') return drawFullScales(context, proportions, scale);
	if (strain === 'mirror') return drawMirrorPlates(context, proportions, scale);
	if (strain === 'linear') return drawLinearRows(context, proportions, scale);
	if (strain === 'fully_scaled') return drawEvenPlates(context, proportions, scale);
	if (strain === 'ghost') return drawGhostPatches(context, proportions, patch);
}

const EvenPlates = { NoseStart: 0.32, TailEnd: -0.34, StepOfLength: 0.045, SmallestStep: 2.2, RadiusAlong: 0.34, RadiusAcross: 0.42 } as const;

function drawEvenPlates(context: CanvasRenderingContext2D, { length, width }: FishProportions, scale: string) {
	context.fillStyle = scale;
	const step = Math.max(EvenPlates.SmallestStep, length * EvenPlates.StepOfLength);
	const rowCount = Math.ceil((length * (EvenPlates.NoseStart - EvenPlates.TailEnd)) / step);
	for (let row = 0; row < rowCount; row++) {
		const x = length * EvenPlates.NoseStart - row * step;
		const halfWidth = flankHalfWidth(x, length, width);
		for (let y = -halfWidth + (row % 2) * step * 0.5; y < halfWidth; y += step) {
			context.beginPath();
			context.ellipse(x, y, step * EvenPlates.RadiusAlong, step * EvenPlates.RadiusAcross, 0, 0, Math.PI * 2);
			context.fill();
		}
	}
}

function drawFullScales(context: CanvasRenderingContext2D, { length, width }: FishProportions, scale: string) {
	context.strokeStyle = scale;
	context.lineWidth = Math.max(0.6, width * 0.025);
	const step = Math.max(2.5, length * 0.055);
	for (let x = length * 0.3; x > -length * 0.32; x -= step) {
		const halfWidth = flankHalfWidth(x, length, width);
		for (let y = -halfWidth + step * 0.5; y < halfWidth; y += step) {
			context.beginPath();
			context.arc(x, y, step * 0.5, Math.PI * 0.6, Math.PI * 1.4);
			context.stroke();
		}
	}
}

function drawMirrorPlates(context: CanvasRenderingContext2D, { length, width }: FishProportions, scale: string) {
	context.fillStyle = scale;
	const plates = [
		[0.22, -0.3, 0.09], [0.05, -0.36, 0.07], [-0.12, -0.28, 0.08], [0.12, 0.34, 0.08], [-0.05, 0.3, 0.06], [-0.24, 0.2, 0.05], [-0.28, -0.14, 0.05]
	];
	for (const [x, y, radius] of plates) {
		context.beginPath();
		context.ellipse(x * length, y * width, radius * length, radius * width * 1.3, 0, 0, Math.PI * 2);
		context.fill();
	}
}

function drawLinearRows(context: CanvasRenderingContext2D, { length, width }: FishProportions, scale: string) {
	context.fillStyle = scale;
	const step = Math.max(3, length * 0.07);
	for (const side of [-1, 1]) {
		for (let x = length * 0.26; x > -length * 0.3; x -= step) {
			const y = side * flankHalfWidth(x, length, width) * 0.72;
			context.beginPath();
			context.ellipse(x, y, step * 0.42, step * 0.3, 0, 0, Math.PI * 2);
			context.fill();
		}
	}
}

function drawGhostPatches(context: CanvasRenderingContext2D, { length, width }: FishProportions, patch: string) {
	context.fillStyle = patch;
	for (const [x, y, radiusX, radiusY] of [[0.36, 0, 0.12, 0.3], [-0.08, -0.22, 0.14, 0.14], [-0.2, 0.18, 0.1, 0.12]]) {
		context.beginPath();
		context.ellipse(x * length, y * width, radiusX * length, radiusY * width, 0, 0, Math.PI * 2);
		context.fill();
	}
}

function flankHalfWidth(x: number, length: number, width: number) {
	const towardsTail = Math.max(0, -x / (length * 0.36));
	const towardsNose = Math.max(0, (x - length * 0.1) / (length * 0.4));
	return (width / 2) * (1 - towardsTail * 0.8) * (1 - towardsNose * 0.45);
}
