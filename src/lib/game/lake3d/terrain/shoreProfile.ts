import { MathUtils } from 'three';
import type { ShoreCharacter } from './shoreCharacter';

export const Shore = { IslandRiseMetres: 2.6, WaterlineDip: 0.06, ToeMetres: 0.1, ToeSwing: 0.3, StepMetres: 0.1 } as const;

export interface BankProfile {
	base: number;
	top: number;
	riseMetres: number;
}

const ToeShareOfRise = 0.45;
const Bed = { PlateauShare: 0.3, DropOffMetres: 1.8 } as const;
const ToeWaves = { AlongX: 0.23, AlongZ: 0.11, Warp: 1.7, AcrossZ: 0.19, AcrossX: 0.07 } as const;

function toeAt(x: number, z: number) {
	const swing = (Math.sin(x * ToeWaves.AlongX + Math.sin(z * ToeWaves.AlongZ) * ToeWaves.Warp) + Math.sin(z * ToeWaves.AcrossZ - x * ToeWaves.AcrossX)) / 2;
	return Shore.ToeMetres + (swing * 0.5 + 0.5) * Shore.ToeSwing;
}

export function bankHeight(fromWater: number, profile: BankProfile, x: number, z: number) {
	const { riseMetres } = profile;
	const rise = MathUtils.smootherstep(fromWater, Math.min(toeAt(x, z), riseMetres * ToeShareOfRise), riseMetres);
	const foot = MathUtils.lerp(-Shore.WaterlineDip, profile.base, MathUtils.smoothstep(fromWater, 0, Shore.StepMetres));
	return MathUtils.lerp(foot, profile.top, rise);
}

export function bedHeight(toShore: number, bedDepth: number, character: ShoreCharacter) {
	const { plateauMetres } = character;
	const gradual = MathUtils.smoothstep(toShore, 0, character.shelfMetres);
	const plateau = MathUtils.smoothstep(toShore, 0, plateauMetres) * Bed.PlateauShare;
	const stepped = plateau + MathUtils.smoothstep(toShore, plateauMetres, plateauMetres + Bed.DropOffMetres) * (1 - Bed.PlateauShare);
	return -Shore.WaterlineDip - bedDepth * character.bedShare * MathUtils.lerp(gradual, stepped, character.dropOff);
}
