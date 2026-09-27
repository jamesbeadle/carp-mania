import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Vector3 } from 'three';

const LinePoints = 24;
const LineLook = { Colour: '#e6f0f4', Opacity: 0.7 } as const;

export interface FishingLine {
	line: Line;
	span: (from: Vector3, to: Vector3, sag: number) => void;
	hide: () => void;
}

export function createFishingLine(): FishingLine {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(LinePoints * 3), 3));
	const line = new Line(geometry, new LineBasicMaterial({ color: LineLook.Colour, transparent: true, opacity: LineLook.Opacity }));
	line.frustumCulled = false;
	line.visible = false;
	const point = new Vector3();
	return {
		line,
		span: (from, to, sag) => {
			const positions = geometry.getAttribute('position');
			for (let index = 0; index < LinePoints; index++) {
				const share = index / (LinePoints - 1);
				point.lerpVectors(from, to, share);
				point.y -= Math.sin(share * Math.PI) * sag;
				positions.setXYZ(index, point.x, point.y, point.z);
			}
			positions.needsUpdate = true;
			line.visible = true;
		},
		hide: () => void (line.visible = false)
	};
}
