import { BufferAttribute, Vector3, type BufferGeometry } from 'three';

const Shade = { Lowest: 0.42, Range: 0.58 } as const;
const Rounding = { Centre: new Vector3(0, 0.4, 0), UpwardShare: 0.15 } as const;
const Up = new Vector3(0, 1, 0);

export function roundedAndShaded(geometry: BufferGeometry) {
	const positions = geometry.getAttribute('position');
	const normals = geometry.getAttribute('normal');
	const colours = new Float32Array(positions.count * 3);
	const direction = new Vector3();
	for (let index = 0; index < positions.count; index++) {
		direction.fromBufferAttribute(positions, index).sub(Rounding.Centre).normalize().lerp(Up, Rounding.UpwardShare).normalize();
		normals.setXYZ(index, direction.x, direction.y, direction.z);
		const shade = Shade.Lowest + Shade.Range * Math.min(1, Math.max(0, positions.getY(index)));
		colours.set([shade, shade, shade], index * 3);
	}
	geometry.setAttribute('color', new BufferAttribute(colours, 3));
	return geometry;
}
