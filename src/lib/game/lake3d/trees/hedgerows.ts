import { Color, IcosahedronGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { renderQuality } from '../renderQuality';
import type { HedgeLine } from '../terrain/fieldPattern';
import type { Country } from '../terrain/lakeLand';

export interface HedgeGround {
	country: Country;
	season: SeasonName;
	seed: number;
	groundAt: (point: WorldPoint) => number;
}

const ClearOfThePlotMetres = 12;
const Blob = { LeastWidth: 3.4, WidthRange: 1.8, LeastHeight: 2.3, HeightRange: 1.5, Lift: 0.4, Radius: 0.5, Jitter: 0.8 } as const;
const Gaps = { Chance: 0.025, Length: 3 } as const;
const HedgeGreen: Record<SeasonName, string> = { spring: '#46682c', summer: '#34502a', autumn: '#5b5a2c', winter: '#4a4638' };
const ShadeVariation = 0.07;
const UpAxis = new Vector3(0, 1, 0);
const HedgeSeed = 211;

export function isOutInTheCountry(point: WorldPoint, country: Country, reach: number) {
	const { shape } = country;
	return shape.metresBeyond(point) > ClearOfThePlotMetres && Math.hypot(point.x, point.z) < reach;
}

function blobsAlong(line: HedgeLine, spacing: number, random: () => number) {
	const { from, to } = line;
	const count = Math.floor(Math.hypot(to.x - from.x, to.z - from.z) / spacing);
	const points: WorldPoint[] = [];
	let gapLeft = 0;
	for (let step = 0; step < count; step++) {
		gapLeft = random() < Gaps.Chance ? Gaps.Length : Math.max(0, gapLeft - 1);
		const share = step / count;
		const point = { x: from.x + (to.x - from.x) * share + (random() - 0.5) * Blob.Jitter, z: from.z + (to.z - from.z) * share + (random() - 0.5) * Blob.Jitter };
		const isInAGap = gapLeft > 0;
		if (!isInAGap) points.push(point);
	}
	return points;
}

function placementOf(point: WorldPoint, height: number, random: () => number) {
	const width = Blob.LeastWidth + random() * Blob.WidthRange;
	const tall = Blob.LeastHeight + random() * Blob.HeightRange;
	const turn = new Quaternion().setFromAxisAngle(UpAxis, random() * Math.PI * 2);
	return new Matrix4().compose(new Vector3(point.x, height, point.z), turn, new Vector3(width, tall, width));
}

export function createHedgerows(ground: HedgeGround) {
	const quality = renderQuality();
	const random = seededRandom(ground.seed + HedgeSeed);
	const { country } = ground;
	const lines = country.fields.hedgesWithin(quality.countryReach);
	const points = lines.flatMap((line) => blobsAlong(line, quality.hedgeSpacing, random)).filter((point) => isOutInTheCountry(point, country, quality.countryReach));
	const geometry = new IcosahedronGeometry(Blob.Radius, quality.hedgeDetail).translate(0, Blob.Lift, 0);
	const mesh = new InstancedMesh(geometry, new MeshStandardMaterial({ roughness: 1 }), Math.max(1, points.length));
	const green = new Color(HedgeGreen[ground.season]);
	points.forEach((point, index) => {
		mesh.setMatrixAt(index, placementOf(point, ground.groundAt(point), random));
		mesh.setColorAt(index, green.clone().offsetHSL(0, 0, (random() - 0.5) * ShadeVariation));
	});
	mesh.count = points.length;
	return mesh;
}
