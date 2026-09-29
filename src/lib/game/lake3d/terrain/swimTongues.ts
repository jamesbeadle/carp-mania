import type { WorldPoint } from '../lakeFrame';
import type { SwimGround } from './swimWear';

export const Tongue = { ReachMetres: 1.95, HalfWidthMetres: 1.2, ShoulderMetres: 1.6, ShoulderFallMetres: 1.7, SoftnessMetres: 0.22, NearMetres: 8, BehindMetres: 1.5, DenseMetres: 0.3 } as const;

interface PodFrame {
	pod: WorldPoint;
	forward: WorldPoint;
}

function frameOf({ pod, heading }: SwimGround): PodFrame {
	return { pod, forward: { x: Math.sin(heading), z: Math.cos(heading) } };
}

function isNearAnyPod(point: WorldPoint, frames: PodFrame[]) {
	return frames.some(({ pod }) => Math.hypot(point.x - pod.x, point.z - pod.z) < Tongue.NearMetres);
}

function densified(points: WorldPoint[], frames: PodFrame[]) {
	return points.flatMap((start, index) => {
		const end = points[(index + 1) % points.length];
		const isNear = isNearAnyPod(start, frames) || isNearAnyPod(end, frames);
		const pieces = isNear ? Math.ceil(Math.hypot(end.x - start.x, end.z - start.z) / Tongue.DenseMetres) : 1;
		return Array.from({ length: pieces }, (_, piece) => ({ x: start.x + ((end.x - start.x) * piece) / pieces, z: start.z + ((end.z - start.z) * piece) / pieces }));
	});
}

function frontReach(across: number) {
	const beyond = Math.max(0, Math.abs(across) - Tongue.HalfWidthMetres) / Tongue.ShoulderMetres;
	return Tongue.ReachMetres - Tongue.ShoulderFallMetres * beyond * beyond;
}

function softlyAtLeast(value: number, least: number) {
	const softness = Tongue.SoftnessMetres;
	return value + softness * Math.log1p(Math.exp((least - value) / softness));
}

function pushedOut(point: WorldPoint, { pod, forward }: PodFrame): WorldPoint {
	const awayX = point.x - pod.x;
	const awayZ = point.z - pod.z;
	const ahead = awayX * forward.x + awayZ * forward.z;
	const across = awayX * forward.z - awayZ * forward.x;
	const isNear = Math.hypot(awayX, awayZ) < Tongue.NearMetres && ahead > -Tongue.BehindMetres;
	if (!isNear) return point;
	const push = softlyAtLeast(ahead, frontReach(across)) - ahead;
	return { x: point.x + forward.x * push, z: point.z + forward.z * push };
}

export function withSwimTongues(outline: WorldPoint[], swims: SwimGround[]) {
	const frames = swims.map(frameOf);
	if (frames.length === 0) return outline;
	return densified(outline, frames).map((point) => frames.reduce(pushedOut, point));
}
