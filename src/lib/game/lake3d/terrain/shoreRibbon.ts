import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { normalsAcrossGrid } from './gridNormals';
import { stationsAround, type RingStation } from './ringWalk';

export interface RibbonRing {
	points: WorldPoint[];
	isIsland: boolean;
}

export interface RibbonPlan {
	rings: RibbonRing[];
	spacing: number;
	offsets: number[];
	edge: WorldPoint | null;
	heightAt: (point: WorldPoint) => number;
}

interface RingPatch {
	positions: Float32Array;
	normals: Float32Array;
	indices: number[];
}

function keptOnThePlot(value: number, half: number | undefined) {
	return half === undefined ? value : Math.min(half, Math.max(-half, value));
}

function patchPositions(stations: RingStation[], plan: RibbonPlan) {
	const { edge, offsets } = plan;
	const positions = new Float32Array(stations.length * offsets.length * 3);
	stations.forEach(({ point, landward }, station) => offsets.forEach((offset, row) => {
		const x = keptOnThePlot(point.x + landward.x * offset, edge?.x);
		const z = keptOnThePlot(point.z + landward.z * offset, edge?.z);
		positions.set([x, plan.heightAt({ x, z }), z], (station * offsets.length + row) * 3);
	}));
	return positions;
}

function patchIndices(stationCount: number, rowCount: number, first: number, isClockwise: boolean) {
	const indices: number[] = [];
	for (let station = 0; station < stationCount; station++) {
		const here = first + station * rowCount;
		const next = first + ((station + 1) % stationCount) * rowCount;
		for (let row = 0; row < rowCount - 1; row++) {
			const quad = isClockwise ? [here + row, here + row + 1, next + row, next + row, here + row + 1, next + row + 1] : [here + row, next + row, here + row + 1, next + row, next + row + 1, here + row + 1];
			indices.push(...quad);
		}
	}
	return indices;
}

function landIsClockwise(stations: RingStation[]) {
	const [{ point: here, landward }, { point: next }] = stations;
	return (next.z - here.z) * landward.x - (next.x - here.x) * landward.z < 0;
}

function ringPatch(ring: RibbonRing, plan: RibbonPlan, first: number): RingPatch {
	const stations = stationsAround(ring.points, ring.isIsland, plan.spacing);
	const positions = patchPositions(stations, plan);
	const { length: rowCount } = plan.offsets;
	const indices = patchIndices(stations.length, rowCount, first, landIsClockwise(stations));
	return { positions, normals: normalsAcrossGrid(positions, rowCount), indices };
}

function joined(parts: Float32Array[], length: number) {
	const whole = new Float32Array(length);
	parts.reduce((offset, part) => (whole.set(part, offset), offset + part.length), 0);
	return whole;
}

export function createRibbonGeometry(plan: RibbonPlan) {
	const patches: RingPatch[] = [];
	let vertexCount = 0;
	plan.rings.forEach((ring) => {
		const patch = ringPatch(ring, plan, vertexCount);
		const { positions } = patch;
		patches.push(patch);
		vertexCount += positions.length / 3;
	});
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(joined(patches.map((patch) => patch.positions), vertexCount * 3), 3));
	geometry.setAttribute('normal', new Float32BufferAttribute(joined(patches.map((patch) => patch.normals), vertexCount * 3), 3));
	geometry.setIndex(patches.flatMap((patch) => patch.indices));
	return geometry;
}
