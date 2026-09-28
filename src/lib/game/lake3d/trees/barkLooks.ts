import { Color } from 'three';
import type { TreeKind } from './treeKinds';

export type BarkStyle = [furrowed: number, papery: number, plated: number];

interface BarkLook {
	trunk: string;
	upper: string;
	upperFrom: number;
	twig: string;
	twigFrom: number;
	style: BarkStyle;
	upperStyle: BarkStyle;
}

const Furrowed: BarkStyle = [1, 0, 0];

const Looks: Record<TreeKind, BarkLook> = {
	oak: { trunk: '#4a4238', upper: '#4f463b', upperFrom: 0.5, twig: '#463d34', twigFrom: 2, style: Furrowed, upperStyle: Furrowed },
	alder: { trunk: '#3e362f', upper: '#4a4038', upperFrom: 0.5, twig: '#40362e', twigFrom: 2, style: [0.7, 0, 0.3], upperStyle: Furrowed },
	willow: { trunk: '#4e4538', upper: '#5a5040', upperFrom: 0.5, twig: '#6e6036', twigFrom: 2, style: Furrowed, upperStyle: Furrowed },
	birch: { trunk: '#35302b', upper: '#cfcbc2', upperFrom: 0.1, twig: '#43332d', twigFrom: 1, style: [0.9, 0.1, 0], upperStyle: [0.05, 0.95, 0] },
	poplar: { trunk: '#4c483f', upper: '#5c574b', upperFrom: 0.4, twig: '#4e473c', twigFrom: 2, style: Furrowed, upperStyle: Furrowed },
	pine: { trunk: '#4a3d33', upper: '#8e5234', upperFrom: 0.55, twig: '#4e3a2c', twigFrom: 1, style: [0.4, 0, 0.6], upperStyle: [0, 0, 1] },
	spruce: { trunk: '#4a3a2f', upper: '#52412f', upperFrom: 0.5, twig: '#43352b', twigFrom: 2, style: [0, 0, 1], upperStyle: [0, 0, 1] }
};

const Blend = { Band: 0.12 } as const;
const GroundDarkening = { Height: 0.04, Least: 0.7 } as const;

export interface BarkPaint {
	colour: Color;
	style: BarkStyle;
}

function mixStyles(first: BarkStyle, second: BarkStyle, share: number): BarkStyle {
	return first.map((weight, index) => weight + (second[index] - weight) * share) as BarkStyle;
}

export function barkPaintAt(kind: TreeKind, level: number, height: number): BarkPaint {
	const look = Looks[kind];
	const upperShare = Math.min(1, Math.max(0, (height - look.upperFrom) / Blend.Band + 1 / 2));
	const colour = new Color(look.trunk).lerp(new Color(look.upper), upperShare);
	const style = mixStyles(look.style, look.upperStyle, upperShare);
	if (level >= look.twigFrom) return { colour: new Color(look.twig), style: Furrowed };
	const groundShade = GroundDarkening.Least + (1 - GroundDarkening.Least) * Math.min(1, height / GroundDarkening.Height);
	return { colour: colour.multiplyScalar(groundShade), style };
}
