import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import type { RasterFrame } from './shoreRaster';
import type { SwimGround } from './swimWear';

const Camp = { NearMetres: 1.2, FarMetres: 3.3, BackMetres: 0.8, Lobes: 3, LobeMetres: 0.45 } as const;
const Path = { NearMetres: 0.18, FarMetres: 0.65, Share: 0.72, MeanderMetres: 0.5, WavelengthMetres: 3.3 } as const;
const ReachMetres = Camp.FarMetres + Camp.LobeMetres;

function campCentre({ peg, pod }: SwimGround): WorldPoint {
	const length = Math.hypot(peg.x - pod.x, peg.z - pod.z) || 1;
	const back = Math.min(Camp.BackMetres, length);
	return { x: pod.x + ((peg.x - pod.x) / length) * back, z: pod.z + ((peg.z - pod.z) / length) * back };
}

function campWear(point: WorldPoint, camp: WorldPoint) {
	const angle = Math.atan2(point.z - camp.z, point.x - camp.x);
	const ragged = Math.sin(angle * Camp.Lobes + camp.x) * Camp.LobeMetres;
	return 1 - MathUtils.smoothstep(Math.hypot(point.x - camp.x, point.z - camp.z) + ragged, Camp.NearMetres, Camp.FarMetres);
}

function pathWear(point: WorldPoint, { peg, pod }: SwimGround) {
	const spanX = pod.x - peg.x;
	const spanZ = pod.z - peg.z;
	const length = Math.hypot(spanX, spanZ) || 1;
	const rawAlong = ((point.x - peg.x) * spanX + (point.z - peg.z) * spanZ) / (length * length);
	const along = MathUtils.clamp(rawAlong, 0, 1);
	const meander = Math.sin((along * length * Math.PI * 2) / Path.WavelengthMetres + peg.z) * Path.MeanderMetres * Math.sin(along * Math.PI);
	const across = ((point.x - peg.x) * spanZ - (point.z - peg.z) * spanX) / length;
	const away = Math.hypot((rawAlong - along) * length, across - meander);
	return (1 - MathUtils.smoothstep(away, Path.NearMetres, Path.FarMetres)) * Path.Share;
}

function paintSwim(frame: RasterFrame, swim: SwimGround, wear: Float32Array) {
	const camp = campCentre(swim);
	const { peg } = swim;
	const toColumn = (x: number) => MathUtils.clamp(Math.floor((x - frame.originX) / frame.texelMetres), 0, frame.across - 1);
	const toRow = (z: number) => MathUtils.clamp(Math.floor((z - frame.originZ) / frame.texelMetres), 0, frame.down - 1);
	for (let row = toRow(Math.min(peg.z, camp.z) - ReachMetres); row <= toRow(Math.max(peg.z, camp.z) + ReachMetres); row++) {
		for (let column = toColumn(Math.min(peg.x, camp.x) - ReachMetres); column <= toColumn(Math.max(peg.x, camp.x) + ReachMetres); column++) {
			const point = { x: frame.originX + (column + 0.5) * frame.texelMetres, z: frame.originZ + (row + 0.5) * frame.texelMetres };
			const texel = row * frame.across + column;
			wear[texel] = Math.max(wear[texel], campWear(point, camp), pathWear(point, swim));
		}
	}
}

export function paintSwimWear(frame: RasterFrame, swims: SwimGround[]) {
	const wear = new Float32Array(frame.across * frame.down);
	swims.forEach((swim) => paintSwim(frame, swim, wear));
	return wear;
}
