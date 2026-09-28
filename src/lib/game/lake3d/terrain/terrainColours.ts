import { Color, MathUtils } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';
import type { GroundSample } from './terrainShape';

const Grass: Record<SeasonName, [string, string, string]> = {
	spring: ['#4f7d2b', '#63903a', '#7e9a45'],
	summer: ['#4d7229', '#60823a', '#8f9451'],
	autumn: ['#62682c', '#737634', '#9a8a4a'],
	winter: ['#5b6b47', '#697555', '#857f62']
};
const Bed: Record<BedType, [string, string]> = { gravel: ['#9a8a62', '#3d3a2a'], clay: ['#7a5a3a', '#34261a'], silt: ['#5a5238', '#221f16'], rock: ['#7d7d76', '#2e2e2b'] };
const Mud = new Color('#4e3b27');
const WetMud = new Color('#35291c');
const PathEarth = new Color('#86744f');
const LushGrass = new Color('#3f6424');
const Patches = { Contrast: 0.22, MeadowWavelength: 70, MeadowShare: 0.45 } as const;
const Lift = { DryFrom: 2, DryAt: 6, MudBelowShare: 0.8, MostDryness: 0.6 } as const;
const Margin = { LushFrom: 1.5, LushTo: 11, Lushness: 0.45 } as const;
const Path = { FromBank: 5.5, Wander: 0.9, WanderWavelength: 21, SolidWithin: 0.45, FadesBy: 1.25, Wear: 0.75 } as const;

function patchiness(x: number, z: number) {
	return Math.sin(x * 0.11 + Math.sin(z * 0.07) * 2) * 0.5 + Math.sin(z * 0.13 - x * 0.05) * 0.5;
}

function meadowAt(point: WorldPoint) {
	const across = point.x / Patches.MeadowWavelength;
	const down = point.z / Patches.MeadowWavelength;
	const wave = Math.sin(across * 1.7 + Math.cos(down * 1.3) * 1.5) * Math.sin(down * 1.1 - across * 0.6);
	return MathUtils.smoothstep(wave, 0.1, 0.7);
}

function pathWearAt(point: WorldPoint, fromBank: number) {
	const wander = Math.sin((point.x + point.z * 0.7) / Path.WanderWavelength) * Path.Wander;
	const offPath = Math.abs(fromBank - Path.FromBank - wander);
	return (1 - MathUtils.smoothstep(offPath, Path.SolidWithin, Path.FadesBy)) * Path.Wear;
}

export class TerrainColours {
	private readonly grass: Color[];
	private readonly bed: Color[];

	constructor(season: SeasonName, bed: BedType, private readonly bedDepth: number) {
		this.grass = Grass[season].map((hex) => new Color(hex));
		this.bed = Bed[bed].map((hex) => new Color(hex));
	}

	at(point: WorldPoint, sample: GroundSample, into: Color) {
		const { height } = sample;
		if (height < 0) return into.copy(this.bed[0]).lerp(this.bed[1], Math.min(1, -height / this.bedDepth)).lerp(WetMud, Math.max(0, 1 + height * 4) * 0.5);
		if (height < Heights.Bank * Lift.MudBelowShare) return into.copy(WetMud).lerp(Mud, height / (Heights.Bank * Lift.MudBelowShare));
		return this.grassAt(point, sample, into);
	}

	private grassAt(point: WorldPoint, sample: GroundSample, into: Color) {
		into.copy(this.grass[0]).lerp(this.grass[1], patchiness(point.x, point.z) * Patches.Contrast + 0.5);
		into.lerp(this.grass[2], meadowAt(point) * Patches.MeadowShare);
		const dryness = MathUtils.clamp((sample.height - Lift.DryFrom) / (Lift.DryAt - Lift.DryFrom), 0, 1);
		into.lerp(this.grass[2], dryness * Lift.MostDryness);
		into.lerp(LushGrass, (1 - MathUtils.smoothstep(sample.fromBank, Margin.LushFrom, Margin.LushTo)) * Margin.Lushness);
		return into.lerp(PathEarth, pathWearAt(point, sample.fromBank));
	}
}

export function meadowOf(season: SeasonName) {
	const [, meadow] = Grass[season];
	return new Color(meadow);
}
