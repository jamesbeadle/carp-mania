import { Color } from 'three';
import type { TreeKind } from './treeKinds';

export type BarkStyle = [furrowed: number, papery: number, plated: number];

interface BarkLook {
	trunk: string;
	upper: string;
	upperFrom: number;
	band: number;
	twig: string;
	twigFrom: number;
	style: BarkStyle;
	upperStyle: BarkStyle;
	crownFrom?: number;
	moss?: number;
}

const Furrowed: BarkStyle = [1, 0, 0];

const Looks: Record<TreeKind, BarkLook> = {
	oak: { trunk: '#574636', upper: '#5a4a3a', upperFrom: 0.5, band: 0.12, twig: '#4a3e33', twigFrom: 2, style: Furrowed, upperStyle: Furrowed, moss: 0.6 },
	alder: { trunk: '#3e362f', upper: '#4a4038', upperFrom: 0.5, band: 0.12, twig: '#40362e', twigFrom: 2, style: [0.7, 0, 0.3], upperStyle: Furrowed, moss: 0.5 },
	willow: { trunk: '#4e4538', upper: '#5a5040', upperFrom: 0.5, band: 0.12, twig: '#57503a', twigFrom: 2, style: Furrowed, upperStyle: Furrowed, moss: 0.5 },
	birch: { trunk: '#35302b', upper: '#b9b4aa', upperFrom: 0.14, band: 0.3, twig: '#43332d', twigFrom: 1, style: [0.9, 0.1, 0], upperStyle: [0.05, 0.95, 0], crownFrom: 0.7 },
	poplar: { trunk: '#4c483f', upper: '#5c574b', upperFrom: 0.4, band: 0.12, twig: '#4e473c', twigFrom: 2, style: Furrowed, upperStyle: Furrowed },
	pine: { trunk: '#4a3d33', upper: '#5c4536', upperFrom: 0.62, band: 0.2, twig: '#4e3a2c', twigFrom: 1, style: [0.4, 0, 0.6], upperStyle: [0, 0, 1] },
	holly: { trunk: '#5b5a52', upper: '#625f57', upperFrom: 0.5, band: 0.12, twig: '#4e4c44', twigFrom: 2, style: [0.4, 0, 0.6], upperStyle: [0.2, 0, 0.8] },
	spruce: { trunk: '#4a3a2f', upper: '#52412f', upperFrom: 0.5, band: 0.12, twig: '#43352b', twigFrom: 2, style: [0, 0, 1], upperStyle: [0, 0, 1] }
};

const Patches = { Strength: 0.3, AroundWaves: 3, HeightWaves: 23, SecondAroundWaves: 5, SecondHeightWaves: 13 } as const;
const GroundDarkening = { Height: 0.04, Least: 0.7 } as const;
const Moss = { Colour: new Color('#3b4a2a'), Height: 0.12, Patchiness: 0.5 } as const;
const CrownFading = { Band: 0.22, Never: 2 } as const;

export interface BarkPaint {
	colour: Color;
	style: BarkStyle;
}

function mixStyles(first: BarkStyle, second: BarkStyle, share: number): BarkStyle {
	return first.map((weight, index) => weight + (second[index] - weight) * share) as BarkStyle;
}

function patchiness(height: number, around: number) {
	return Math.sin(around * Patches.AroundWaves + height * Patches.HeightWaves) * Math.sin(around * Patches.SecondAroundWaves - height * Patches.SecondHeightWaves) * Patches.Strength;
}

export function barkPaintAt(kind: TreeKind, level: number, height: number, around: number): BarkPaint {
	const look = Looks[kind];
	const upperShare = Math.min(1, Math.max(0, (height - look.upperFrom) / look.band + 1 / 2 + patchiness(height, around)));
	const crownShare = Math.min(1, Math.max(0, (height - (look.crownFrom ?? CrownFading.Never)) / CrownFading.Band));
	const colour = new Color(look.trunk).lerp(new Color(look.upper), upperShare).lerp(new Color(look.twig), crownShare);
	const style = mixStyles(look.style, look.upperStyle, upperShare);
	if (level >= look.twigFrom) return { colour: new Color(look.twig), style: Furrowed };
	const groundShade = GroundDarkening.Least + (1 - GroundDarkening.Least) * Math.min(1, height / GroundDarkening.Height);
	const mossShare = level === 0 ? (look.moss ?? 0) * Math.max(0, 1 - height / Moss.Height + patchiness(height, around) * Moss.Patchiness) : 0;
	return { colour: colour.lerp(Moss.Colour, Math.min(1, mossShare)).multiplyScalar(groundShade), style };
}
