import { Color, Vector3 } from 'three';
import { GeometryWriter } from './geometryWriter';
import type { AtlasRegion } from './atlasRegions';

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
	spin: number;
	axis: Vector3;
	haze: number;
}

export interface Strip {
	path: Vector3[];
	halfWidth: number;
	region: AtlasRegion;
	order: number;
	haze: number;
}

const UpAxisOfMarker = new Vector3(0, 1, 0);

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
		{ name: 'leafCorner', size: 2 },
		{ name: 'leafAxis', size: 3 },
		{ name: 'leafHaze', size: 1 }
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
	const { across, down, spin, axis } = card;
	const halfAcross = across.length();
	const halfDown = down.length();
	const corners = Corners.map(([acrossShare, downShare]) => {
		const offsetAcross = acrossShare * 2 - 1;
		const offsetDown = downShare * 2 - 1;
		const resting = card.centre.clone().addScaledVector(across, offsetAcross).addScaledVector(down, offsetDown);
		const shading = shade(resting);
		const corner = spun(offsetAcross * halfAcross, -offsetDown * halfDown, spin);
		return writer.vertex(card.centre, shading.normal, atlasU(card.region, acrossShare), atlasV(card.region, downShare), shading.colour, [0, card.order, ...corner, axis.x, axis.y, axis.z, card.haze]);
	});
	writer.quad(corners[0], corners[3], corners[2], corners[1]);
}

export function writeStrip(writer: GeometryWriter, strip: Strip, shade: ShadeLeaf) {
	const { path } = strip;
	const steps = path.length - 1;
	let previous: number[] = [];
	path.forEach((point, index) => {
		const share = index / steps;
		const shading = shade(point);
		const pair = [-1, 1].map((side) => writer.vertex(point, shading.normal, atlasU(strip.region, (side + 1) / 2), atlasV(strip.region, share), shading.colour, [share, strip.order, side * strip.halfWidth, 0, 0, 0, 0, strip.haze]));
		if (previous.length > 0) writer.quad(previous[0], pair[0], pair[1], previous[1]);
		previous = pair;
	});
}

const Unlit = new Color();

export function markBounds(writer: GeometryWriter, least: Vector3, most: Vector3) {
	[least, most].forEach((corner) => {
		const marker = writer.vertex(corner, UpAxisOfMarker, 0, 0, Unlit, [0, 0, 0, 0, 0, 0, 0, 0]);
		writer.triangle(marker, marker, marker);
	});
}
