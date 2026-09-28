import { BufferAttribute, Color, Vector3, type BufferGeometry } from 'three';

export const WoodTones = {
	Bark: new Color('#54463a'),
	Root: new Color('#5e4e3e'),
	Soil: new Color('#4a3a2a'),
	Bleached: new Color('#9a948a'),
	Wet: new Color('#2a241c'),
	Algae: new Color('#3e4c22'),
	Drowned: new Color('#1e2216')
} as const;

const Waterline = { DrownedBelow: -0.06, AlgaeTop: 0.14, WetTop: 0.45, WetStrength: 0.65 } as const;
const Weathering = { FacingUpFrom: 0.45, Strength: 0.55 } as const;
const Mottle = { Swing: 0.26 } as const;

function toneAt(height: number, upness: number, base: Color, into: Color) {
	into.copy(base).lerp(WoodTones.Bleached, Math.max(0, upness - Weathering.FacingUpFrom) * Weathering.Strength);
	const wet = 1 - Math.min(1, Math.max(0, height / Waterline.WetTop));
	into.lerp(WoodTones.Wet, wet * Waterline.WetStrength);
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
