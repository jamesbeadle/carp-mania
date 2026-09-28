import { Vector3, type Color } from 'three';
import { GeometryWriter } from './geometryWriter';
import type { AtlasRegion } from './foliageAtlas';

export interface LeafShading {
	normal: Vector3;
	colour: Color;
}

export type ShadeLeaf = (position: Vector3) => LeafShading;

export interface Card {
	centre: Vector3;
	across: Vector3;
	down: Vector3;
	region: AtlasRegion;
	order: number;
	spin: number | null;
}

export interface Strip {
	path: Vector3[];
	across: Vector3;
	region: AtlasRegion;
	order: number;
}

const Corners: [number, number][] = [
	[0, 0],
	[1, 0],
	[1, 1],
	[0, 1]
];

export function leafWriter() {
	return new GeometryWriter([
		{ name: 'dangle', size: 1 },
		{ name: 'cardOrder', size: 1 },
		{ name: 'leafCorner', size: 2 }
	]);
}

function atlasU(region: AtlasRegion, share: number) {
	return region.x + share * region.width;
}

function atlasV(region: AtlasRegion, share: number) {
	return region.y + share * region.height;
}

function spun(across: number, up: number, spin: number) {
	const cosine = Math.cos(spin);
	const sine = Math.sin(spin);
	return [across * cosine - up * sine, across * sine + up * cosine];
}

export function writeCard(writer: GeometryWriter, card: Card, shade: ShadeLeaf) {
	const half = card.across.length();
	const { spin } = card;
	const corners = Corners.map(([across, down]) => {
		const offsetAcross = across * 2 - 1;
		const offsetDown = down * 2 - 1;
		const resting = card.centre.clone().addScaledVector(card.across, offsetAcross).addScaledVector(card.down, offsetDown);
		const shading = shade(resting);
		const position = spin === null ? resting : card.centre;
		const corner = spin === null ? [0, 0] : spun(offsetAcross * half, -offsetDown * half, spin);
		return writer.vertex(position, shading.normal, atlasU(card.region, across), atlasV(card.region, down), shading.colour, [0, card.order, ...corner]);
	});
	writer.quad(corners[0], corners[3], corners[2], corners[1]);
}

export function writeStrip(writer: GeometryWriter, strip: Strip, shade: ShadeLeaf) {
	const { path } = strip;
	const steps = path.length - 1;
	let previous: number[] = [];
	path.forEach((point, index) => {
		const share = index / steps;
		const pair = [-1, 1].map((side) => {
			const position = point.clone().addScaledVector(strip.across, side);
			const shading = shade(position);
			return writer.vertex(position, shading.normal, atlasU(strip.region, (side + 1) / 2), atlasV(strip.region, share), shading.colour, [share, strip.order, 0, 0]);
		});
		if (previous.length > 0) writer.quad(previous[0], pair[0], pair[1], previous[1]);
		previous = pair;
	});
}
