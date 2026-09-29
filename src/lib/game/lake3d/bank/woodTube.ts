import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from 'three';
import type { RandomFraction } from '$lib/domain/random';

export interface WoodLimb {
	points: Vector3[];
	fromRadius: number;
	toRadius: number;
	sides: number;
	roughness: number;
}

const Rings = { PerMetre: 2.2, Fewest: 2, PerJoint: 3 } as const;
const Bark = { TileMetres: 0.9, LeastWraps: 1 } as const;

function ringCount(curve: CatmullRomCurve3, limb: WoodLimb) {
	const { points } = limb;
	return Math.max(Rings.Fewest, Math.round(curve.getLength() * Rings.PerMetre), points.length * Rings.PerJoint);
}

function radiusAt(limb: WoodLimb, along: number, wobble: number) {
	const taper = limb.fromRadius + (limb.toRadius - limb.fromRadius) * along;
	return taper * (1 + wobble * limb.roughness);
}

function ringIndices(rings: number, sides: number) {
	const indices: number[] = [];
	for (let ring = 0; ring < rings; ring++) {
		for (let side = 0; side < sides; side++) {
			const here = ring * (sides + 1) + side;
			const ahead = here + sides + 1;
			indices.push(here, ahead, here + 1, ahead, ahead + 1, here + 1);
		}
	}
	return indices;
}

interface TubeFrame {
	curve: CatmullRomCurve3;
	frames: ReturnType<CatmullRomCurve3['computeFrenetFrames']>;
	rings: number;
	wraps: number;
}

function ringInto(tube: TubeFrame, ring: number, limb: WoodLimb, random: RandomFraction, into: { positions: number[]; uvs: number[] }) {
	const { curve, frames, rings, wraps } = tube;
	const { normals, binormals } = frames;
	const along = ring / rings;
	const centre = curve.getPointAt(along);
	const wobbles = Array.from({ length: limb.sides }, () => random() - 1 / 2);
	const offset = new Vector3();
	const alongMetres = (along * curve.getLength()) / Bark.TileMetres;
	for (let side = 0; side <= limb.sides; side++) {
		const turn = (side / limb.sides) * Math.PI * 2;
		const radius = radiusAt(limb, along, wobbles[side % limb.sides]);
		offset.copy(normals[ring]).multiplyScalar(Math.cos(turn)).addScaledVector(binormals[ring], Math.sin(turn));
		into.positions.push(...offset.multiplyScalar(radius).add(centre).toArray());
		into.uvs.push(alongMetres, (side / limb.sides) * wraps);
	}
}

export function woodTube(limb: WoodLimb, random: RandomFraction) {
	const curve = new CatmullRomCurve3(limb.points);
	const rings = ringCount(curve, limb);
	const wraps = Math.max(Bark.LeastWraps, Math.round((Math.PI * 2 * limb.fromRadius) / Bark.TileMetres));
	const tube = { curve, frames: curve.computeFrenetFrames(rings, false), rings, wraps };
	const into = { positions: [] as number[], uvs: [] as number[] };
	for (let ring = 0; ring <= rings; ring++) ringInto(tube, ring, limb, random, into);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(into.positions, 3));
	geometry.setAttribute('uv', new Float32BufferAttribute(into.uvs, 2));
	geometry.setIndex(ringIndices(rings, limb.sides));
	geometry.computeVertexNormals();
	return geometry;
}
