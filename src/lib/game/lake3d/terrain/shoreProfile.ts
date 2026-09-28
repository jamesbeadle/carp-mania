import { MathUtils } from 'three';

export const Shore = { DropMetres: 0.9, IslandDropMetres: 2.6, WaterlineDip: 0.06, ShelfMetres: 9, ToeMetres: 0.1, ToeSwing: 0.3 } as const;

function toeAt(x: number, z: number) {
	const swing = Math.sin(x * 0.23 + Math.sin(z * 0.11) * 1.7) * 0.5 + Math.sin(z * 0.19 - x * 0.07) * 0.5;
	return Shore.ToeMetres + (swing * 0.5 + 0.5) * Shore.ToeSwing;
}

export function bankHeight(fromWater: number, top: number, x: number, z: number, isIsland: boolean) {
	const drop = isIsland ? Shore.IslandDropMetres : Shore.DropMetres;
	const rise = MathUtils.smootherstep(fromWater, toeAt(x, z), drop);
	return MathUtils.lerp(-Shore.WaterlineDip, top, rise);
}

export function bedHeight(toShore: number, bedDepth: number) {
	return -Shore.WaterlineDip - bedDepth * MathUtils.smoothstep(toShore, 0, Shore.ShelfMetres);
}
