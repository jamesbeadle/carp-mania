import { Color, Vector4 } from 'three';
import type { RandomFraction } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { centredRandom } from './centredRandom';
import { isEvergreen, type TreeKind } from './treeKinds';

type Palette = Record<TreeKind, string[]>;

const Evergreen = { pine: ['#3c4e2a', '#44562e', '#384a28'], spruce: ['#2c3e28', '#31442c', '#293a26'] };

const Foliage: Record<SeasonName, Palette> = {
	spring: { oak: ['#7d9c3c', '#8aa642', '#709238'], alder: ['#5e8436', '#688c3a'], willow: ['#98b058', '#a2b660'], birch: ['#92b242', '#9ebc4a'], poplar: ['#7c9c3e', '#88a444'], ...Evergreen },
	summer: { oak: ['#4a5e24', '#52682a', '#435a22'], alder: ['#3a4e22', '#405426'], willow: ['#6f8544', '#778b48'], birch: ['#5e7a30', '#688236'], poplar: ['#465e26', '#4e662a'], ...Evergreen },
	autumn: { oak: ['#8c6a2a', '#a2722e', '#6f6c2e', '#5f6e2e', '#94582a'], alder: ['#6e6a30', '#7c6a2e', '#5e6630'], willow: ['#b2a244', '#a8a64a', '#8e9a44'], birch: ['#d2a232', '#c8902a', '#baa236', '#8e9a3c'], poplar: ['#caa234', '#b8942e'], ...Evergreen },
	winter: { oak: ['#8e847e', '#887f7a'], alder: ['#84807e'], willow: ['#8a7e62', '#84785e'], birch: ['#8a706c', '#846a68'], poplar: ['#8a8684'], ...Evergreen }
};

const TreeShade = { Brightness: 0.35, Hue: 0.012 } as const;
const Fullness = { AutumnLeast: 0.5, AutumnRange: 0.5, Spread: 7.31 } as const;
interface ClumpTint {
	hue: number;
	hueRange: number;
	saturation: number;
	lightness: number;
	lightnessRange: number;
}

const ClumpTints: Record<SeasonName, ClumpTint> = {
	spring: { hue: 0.17, hueRange: 0.1, saturation: 0.18, lightness: 0.86, lightnessRange: 0.12 },
	summer: { hue: 0.18, hueRange: 0.12, saturation: 0.14, lightness: 0.85, lightnessRange: 0.14 },
	autumn: { hue: 0.02, hueRange: 0.26, saturation: 0.35, lightness: 0.8, lightnessRange: 0.18 },
	winter: { hue: 0.94, hueRange: 0.12, saturation: 0.05, lightness: 0.84, lightnessRange: 0.1 }
};

const Seasons = { Bare: 'winter', Thinning: 'autumn' } as const satisfies Record<string, SeasonName>;

export function isBare(season: SeasonName, kind: TreeKind) {
	return season === Seasons.Bare && !isEvergreen(kind);
}

export function crownColourOf(season: SeasonName, kind: TreeKind, pick: number, shade: number) {
	const palette = Foliage[season][kind];
	const colour = new Color(palette[Math.floor(pick * palette.length) % palette.length]);
	const offset = shade - 1 / 2;
	colour.offsetHSL(offset * TreeShade.Hue * 2, 0, 0).multiplyScalar(1 + offset * TreeShade.Brightness);
	const isThinning = season === Seasons.Thinning && !isEvergreen(kind);
	const fullness = isThinning ? Fullness.AutumnLeast + Fullness.AutumnRange * ((pick * Fullness.Spread) % 1) : 1;
	return new Vector4(colour.r, colour.g, colour.b, fullness);
}

export function clumpTintFor(season: SeasonName) {
	const tint = ClumpTints[season];
	return (random: RandomFraction) => new Color().setHSL(tint.hue + random() * tint.hueRange, tint.saturation, tint.lightness + centredRandom(random) * tint.lightnessRange);
}
