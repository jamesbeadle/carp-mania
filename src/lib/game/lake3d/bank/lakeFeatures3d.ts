import { Group } from 'three';
import { seededRandom } from '$lib/domain/random';
import { isAreaFeature, isReedLine, isSnag, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import { worldPointOf, type LakeFrame, type WorldPoint } from '../lakeFrame';
import { isInsideOutline } from '../worldGeometry';
import { smoothWorldOutline } from '../worldShapes';
import { createLilyPads } from './lilyPads';
import { snagAt } from './snag3d';

const Lilies = { PerSquareMetre: 0.5, Most: 900 } as const;

function scatterWithin(area: WorldPoint[], random: () => number) {
	const xs = area.map((point) => point.x);
	const zs = area.map((point) => point.z);
	const least = { x: Math.min(...xs), z: Math.min(...zs) };
	const size = { x: Math.max(...xs) - least.x, z: Math.max(...zs) - least.z };
	const count = Math.min(Lilies.Most, Math.round(size.x * size.z * Lilies.PerSquareMetre));
	return Array.from({ length: count }, () => ({ x: least.x + random() * size.x, z: least.z + random() * size.z })).filter((point) => isInsideOutline(point, area));
}

export function reedLinesOf(layout: LakeLayout, frame: LakeFrame): WorldPoint[][] {
	return layout.features.filter(isReedLine).map((line) => line.points.map((point) => worldPointOf(frame, point)));
}

export function createLakeFeatures(layout: LakeLayout, frame: LakeFrame, seed: number) {
	const random = seededRandom(seed);
	const lilyAreas = layout.features.filter(isAreaFeature).filter((area) => area.kind === 'lily_pads');
	const lilyPoints = lilyAreas.flatMap((area) => scatterWithin(smoothWorldOutline(frame, area.points), random));
	const group = new Group().add(createLilyPads(lilyPoints, random));
	layout.features.filter(isSnag).forEach((snag) => group.add(snagAt(worldPointOf(frame, snag.point), random)));
	return group;
}
