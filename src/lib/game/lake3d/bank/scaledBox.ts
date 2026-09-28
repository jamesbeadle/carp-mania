import { BoxGeometry } from 'three';

const VerticesPerFace = 4;

export function scaledBox(width: number, height: number, depth: number) {
	const geometry = new BoxGeometry(width, height, depth);
	const faceSizes: [number, number][] = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]];
	const uvs = geometry.getAttribute('uv');
	faceSizes.forEach(([across, up], face) => {
		for (let corner = 0; corner < VerticesPerFace; corner++) {
			const index = face * VerticesPerFace + corner;
			uvs.setXY(index, uvs.getX(index) * across, uvs.getY(index) * up);
		}
	});
	return geometry;
}
