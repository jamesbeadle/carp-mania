import { Color, Float32BufferAttribute, MathUtils, Mesh, RingGeometry } from 'three';
import { createGroundMaterial, type GroundLook } from './groundMaterial';

const Hills = { Inner: 1, Outer: 5.5, Around: 256, Rings: 22, Height: 55, Sink: 0.6, FullShare: 0.55 } as const;
const Ridges = [
	{ turns: 3, phase: 1.3, weight: 0.36 },
	{ turns: 7, phase: 0.4, weight: 0.28 },
	{ turns: 13, phase: 2.1, weight: 0.18 },
	{ turns: 31, phase: 0.9, weight: 0.1 },
	{ turns: 67, phase: 1.7, weight: 0.05 },
	{ turns: 131, phase: 0.2, weight: 0.03 }
];
const Folds = { Turns: 5, Waves: 9, Depth: 0.3 } as const;
const Near = new Color('#ffffff');
const FarBlue = new Color('#a9bcc0');

function hillHeight(angle: number, share: number) {
	const ridge = Ridges.reduce((sum, { turns, phase, weight }) => sum + Math.sin(angle * turns + phase) * weight, 0);
	const folds = 1 - Folds.Depth * (0.5 + 0.5 * Math.sin(share * Folds.Waves + angle * Folds.Turns));
	const rise = MathUtils.smootherstep(share, 0, Hills.FullShare);
	return (ridge * 0.5 + 0.5) * folds * rise * Hills.Height;
}

export function createFarHills(innerRadius: number, groundHeight: number, look: GroundLook) {
	const geometry = new RingGeometry(innerRadius * Hills.Inner, innerRadius * Hills.Outer, Hills.Around, Hills.Rings).rotateX(-Math.PI / 2);
	const positions = geometry.getAttribute('position');
	const colours = new Float32Array(positions.count * 3);
	const colour = new Color();
	for (let index = 0; index < positions.count; index++) {
		const x = positions.getX(index);
		const z = positions.getZ(index);
		const share = (Math.hypot(x, z) / innerRadius - Hills.Inner) / (Hills.Outer - Hills.Inner);
		positions.setY(index, groundHeight - Hills.Sink + hillHeight(Math.atan2(z, x), share));
		colour.copy(Near).lerp(FarBlue, share).toArray(colours, index * 3);
	}
	geometry.setAttribute('color', new Float32BufferAttribute(colours, 3));
	geometry.computeVertexNormals();
	const material = createGroundMaterial(look);
	material.vertexColors = true;
	return new Mesh(geometry, material);
}
