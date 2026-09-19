import type { BedType } from '$lib/domain/types';

export const SceneSize = { Width: 960, Height: 640 } as const;

export const BankPalette = {
	GrassFar: 'hsl(96 32% 30%)',
	GrassNear: 'hsl(92 38% 38%)',
	Path: 'hsl(38 25% 55%)',
	Shore: 'hsl(40 30% 46%)',
	Reed: 'hsl(70 45% 32%)',
	SanctuaryLine: 'hsl(48 80% 62%)',
	ReedTip: 'hsl(40 55% 60%)',
	Peg: 'hsl(30 32% 36%)',
	PegPlank: 'hsla(28 40% 14% / 0.45)',
	PegEdge: 'hsl(34 38% 50%)',
	PegShadow: 'hsla(0 0% 0% / 0.28)',
	PegLift: 'hsla(42 60% 92% / 0.55)',
	PegChosenRing: 'hsla(42 90% 68% / 0.55)',
	PegChosenGlow: 'hsla(42 90% 68% / 0.22)',
	BountyMarker: 'hsl(42 90% 58%)',
	BountyMarkerFace: 'hsl(120 14% 3%)',
	Label: 'hsl(42 40% 92%)',
	LabelBackdrop: 'hsla(0 0% 0% / 0.45)'
} as const;

export const AnglerPalette = {
	Skin: 'hsl(28 45% 70%)',
	Jacket: 'hsl(90 20% 30%)',
	Hat: 'hsl(40 30% 25%)',
	Chair: 'hsl(120 12% 22%)',
	Shadow: 'hsla(0 0% 0% / 0.25)',
	Rod: 'hsl(30 20% 20%)',
	Pod: 'hsl(0 0% 18%)',
	Line: 'hsla(200 60% 88% / 0.5)',
	LineTight: 'hsla(200 60% 92% / 0.8)',
	Float: 'hsl(40 30% 92%)',
	FloatEdge: 'hsla(0 0% 0% / 0.5)',
	Ripple: 'hsla(190 30% 95% / 0.5)',
	BiteTag: 'hsl(2 78% 62%)',
	Bivvy: 'hsl(95 22% 34%)',
	BivvyLight: 'hsla(95 30% 60% / 0.35)',
	BivvyDoor: 'hsla(90 20% 10% / 0.6)'
} as const;

const bedTints: Record<BedType, string> = {
	gravel: 'hsla(46 45% 80% / 0.22)',
	clay: 'hsla(24 55% 42% / 0.38)',
	silt: 'hsla(90 25% 10% / 0.45)',
	rock: 'hsla(210 10% 62% / 0.38)'
};

export const BedPalette = {
	Tint: bedTints,
	GravelSpeckle: 'hsla(46 55% 92% / 0.55)',
	BarStreak: 'hsla(46 50% 86% / 0.42)',
	BarRidge: 'hsla(46 60% 96% / 0.5)'
} as const;

export const DepthShade = { AlphaPerFoot: 0.06, MaximumAlpha: 0.5, SoftEdgePixels: 16 } as const;

export const LilyPalette = {
	Pad: 'hsl(104 38% 30%)',
	Highlight: 'hsla(100 55% 66% / 0.7)'
} as const;

export const SnagPalette = {
	Trunk: 'hsl(28 32% 22%)',
	Branch: 'hsl(28 28% 30%)',
	Shadow: 'hsla(0 0% 0% / 0.3)'
} as const;

export const DraftPalette = {
	Valid: 'hsl(119 79% 57%)',
	ValidFill: 'hsla(119 79% 57% / 0.14)',
	Invalid: 'hsl(2 78% 54%)',
	InvalidFill: 'hsla(2 78% 54% / 0.14)'
} as const;

export function waterColour(transparency: number, depthFraction: number) {
	const clarity = transparency / 100;
	const hue = 160 + (1 - clarity) * 40;
	const saturation = 30 + clarity * 25;
	const lightness = 28 - depthFraction * 12 - (1 - clarity) * 6;
	return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function depthShadeColour(feetBelowBase: number) {
	const alpha = Math.min(DepthShade.MaximumAlpha, Math.abs(feetBelowBase) * DepthShade.AlphaPerFoot);
	if (feetBelowBase < 0) return `hsla(70 40% 80% / ${alpha})`;
	return `hsla(205 50% 5% / ${alpha})`;
}

export function weedColour(alpha: number) {
	return `hsla(110 40% 30% / ${alpha})`;
}

export function showingRippleColour(alpha: number) {
	return `hsla(185 35% 92% / ${alpha})`;
}
