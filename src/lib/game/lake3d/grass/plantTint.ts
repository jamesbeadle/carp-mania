import { Color } from 'three';

export interface PlantTint {
	shade: number;
	warmth: number;
}

const Warmth = new Color('#f4e2a0');

export function tintColour(tint: PlantTint, into: Color) {
	return into.setScalar(tint.shade).lerp(Warmth, tint.warmth);
}
