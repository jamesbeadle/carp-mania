import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat } from 'three';
import { seededRandom } from '$lib/domain/random';

const Caustic = { Pixels: 128, Cells: 14, Seed: 61, LineWidth: 0.2, Sharpness: 2.2 } as const;
const ByteMost = 255;
const Wraps = [-1, 0, 1];

function featurePoints() {
	const random = seededRandom(Caustic.Seed);
	const points = Array.from({ length: Caustic.Cells }, () => ({ x: random(), y: random() }));
	return points.flatMap((point) => Wraps.flatMap((across) => Wraps.map((down) => ({ x: point.x + across, y: point.y + down }))));
}

function edgeGlow(points: { x: number; y: number }[], u: number, v: number) {
	let nearest = Infinity;
	let second = Infinity;
	for (const point of points) {
		const distance = Math.hypot(point.x - u, point.y - v);
		second = distance < nearest ? nearest : Math.min(second, distance);
		nearest = Math.min(nearest, distance);
	}
	const gap = (second - nearest) * Math.sqrt(Caustic.Cells);
	return Math.max(0, 1 - gap / Caustic.LineWidth) ** Caustic.Sharpness;
}

let painted: DataTexture | null = null;

export function causticTile() {
	if (painted) return painted;
	const points = featurePoints();
	const data = new Uint8Array(Caustic.Pixels * Caustic.Pixels * 4);
	for (let pixel = 0; pixel < Caustic.Pixels * Caustic.Pixels; pixel++) {
		const glow = edgeGlow(points, ((pixel % Caustic.Pixels) + 0.5) / Caustic.Pixels, (Math.floor(pixel / Caustic.Pixels) + 0.5) / Caustic.Pixels) * ByteMost;
		data.set([glow, glow, glow, ByteMost], pixel * 4);
	}
	painted = new DataTexture(data, Caustic.Pixels, Caustic.Pixels, RGBAFormat);
	painted.wrapS = RepeatWrapping;
	painted.wrapT = RepeatWrapping;
	painted.magFilter = LinearFilter;
	painted.minFilter = LinearMipmapLinearFilter;
	painted.generateMipmaps = true;
	painted.needsUpdate = true;
	return painted;
}
