import { BufferAttribute, Color, Vector3, type BufferGeometry } from 'three';

export const WoodTones = {
	Bark: new Color('#5e4a38'),
	Root: new Color('#6a5846'),
	Soil: new Color('#5a4430'),
	Bleached: new Color('#8a7e70'),
	Algae: new Color('#3e4c22'),
	Drowned: new Color('#1e2216')
} as const;

const Waterline = { DrownedBelow: -0.06, AlgaeTop: 0.14 } as const;
const Weathering = { FacingUpFrom: 0.45, Strength: 0.55 } as const;
const Mottle = { Swing: 0.16 } as const;

function toneAt(height: number, upness: number, base: Color, into: Color) {
	into.copy(base).lerp(WoodTones.Bleached, Math.max(0, upness - Weathering.FacingUpFrom) * Weathering.Strength);
	const algae = 1 - Math.min(1, Math.max(0, height / Waterline.AlgaeTop));
	into.lerp(WoodTones.Algae, algae);
	const drowned = Math.min(1, Math.max(0, height / Waterline.DrownedBelow));
	return into.lerp(WoodTones.Drowned, drowned);
}

export function shadedWood(geometry: BufferGeometry, base: Color, random: () => number) {
	const positions = geometry.getAttribute('position');
	const normals = geometry.getAttribute('normal');
	const colours = new Float32Array(positions.count * 3);
	const tone = base.clone().offsetHSL(0, 0, (random() - 1 / 2) * Mottle.Swing);
	const colour = new Color();
	const normal = new Vector3();
	for (let index = 0; index < positions.count; index++) {
		normal.fromBufferAttribute(normals, index);
		toneAt(positions.getY(index), normal.y, tone, colour).toArray(colours, index * 3);
	}
	geometry.setAttribute('color', new BufferAttribute(colours, 3));
	return geometry;
}
