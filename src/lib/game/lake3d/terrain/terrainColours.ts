import { Color } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { Heights } from '../lakeGround';

const Grass: Record<SeasonName, [string, string, string]> = {
	spring: ['#4f7d2b', '#63903a', '#7e9a45'],
	summer: ['#4d7229', '#60823a', '#8f9451'],
	autumn: ['#62682c', '#737634', '#9a8a4a'],
	winter: ['#5b6b47', '#697555', '#857f62']
};
const Bed: Record<BedType, [string, string]> = { gravel: ['#9a8a62', '#3d3a2a'], clay: ['#7a5a3a', '#34261a'], silt: ['#5a5238', '#221f16'], rock: ['#7d7d76', '#2e2e2b'] };
const Mud = new Color('#4e3b27');
const WetMud = new Color('#35291c');
const Patches = { Contrast: 0.22 } as const;
const Lift = { DryFrom: 2, DryAt: 6, MudBelowShare: 0.8 } as const;

function patchiness(x: number, z: number) {
	return Math.sin(x * 0.11 + Math.sin(z * 0.07) * 2) * 0.5 + Math.sin(z * 0.13 - x * 0.05) * 0.5;
}

export class TerrainColours {
	private readonly grass: Color[];
	private readonly bed: Color[];

	constructor(season: SeasonName, bed: BedType) {
		this.grass = Grass[season].map((hex) => new Color(hex));
		this.bed = Bed[bed].map((hex) => new Color(hex));
	}

	at(x: number, z: number, height: number, bedDepth: number, into: Color) {
		if (height < 0) return into.copy(this.bed[0]).lerp(this.bed[1], Math.min(1, -height / bedDepth)).lerp(WetMud, Math.max(0, 1 + height * 4) * 0.5);
		if (height < Heights.Bank * Lift.MudBelowShare) return into.copy(WetMud).lerp(Mud, height / (Heights.Bank * Lift.MudBelowShare));
		const mix = patchiness(x, z) * Patches.Contrast + 0.5;
		into.copy(this.grass[0]).lerp(this.grass[1], mix);
		const dryness = Math.min(1, Math.max(0, (height - Lift.DryFrom) / (Lift.DryAt - Lift.DryFrom)));
		return into.lerp(this.grass[2], dryness * 0.6);
	}
}
