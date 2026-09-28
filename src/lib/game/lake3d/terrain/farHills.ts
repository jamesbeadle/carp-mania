import { Color, Float32BufferAttribute, Mesh, MeshStandardMaterial, RingGeometry } from 'three';

const Hills = { Inner: 1, Outer: 5.5, Around: 96, Rings: 14, Height: 55, Sink: 0.6, BlueDistance: 0.6 } as const;
const NearGreen = new Color('#4f6e2c');
const FarBlue = new Color('#5f7a78');

function hillHeight(angle: number, reach: number) {
	const ridge = Math.sin(angle * 3 + 1.3) * 0.4 + Math.sin(angle * 7 + 0.4) * 0.35 + Math.sin(angle * 13) * 0.25;
	const rise = Math.min(1, Math.max(0, (reach - Hills.Inner) / (Hills.Outer - Hills.Inner) / Hills.BlueDistance));
	return (ridge * 0.5 + 0.5) * rise * Hills.Height;
}

export function createFarHills(innerRadius: number, groundHeight: number) {
	const geometry = new RingGeometry(innerRadius * Hills.Inner, innerRadius * Hills.Outer, Hills.Around, Hills.Rings).rotateX(-Math.PI / 2);
	const positions = geometry.getAttribute('position');
	const colours = new Float32Array(positions.count * 3);
	const colour = new Color();
	for (let index = 0; index < positions.count; index++) {
		const x = positions.getX(index);
		const z = positions.getZ(index);
		const reach = Math.hypot(x, z) / innerRadius;
		positions.setY(index, groundHeight - Hills.Sink + hillHeight(Math.atan2(z, x), reach));
		colour.copy(NearGreen).lerp(FarBlue, Math.min(1, (reach - Hills.Inner) / (Hills.Outer - Hills.Inner))).toArray(colours, index * 3);
	}
	geometry.setAttribute('color', new Float32BufferAttribute(colours, 3));
	geometry.computeVertexNormals();
	return new Mesh(geometry, new MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
}
