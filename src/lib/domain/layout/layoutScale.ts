import type { LayoutPoint } from './layoutTypes';

export const SquareFeetPerAcre = 43560;
export const SceneAspect = { Width: 3, Height: 2 } as const;

export interface LayoutScale {
	feetAcross: number;
	feetDown: number;
}

export function layoutScaleFor(plotAcres: number): LayoutScale {
	const feetAcross = Math.sqrt((plotAcres * SquareFeetPerAcre * SceneAspect.Width) / SceneAspect.Height);
	return { feetAcross, feetDown: feetAcross * (SceneAspect.Height / SceneAspect.Width) };
}

export function feetBetween(scale: LayoutScale, first: LayoutPoint, second: LayoutPoint) {
	const acrossFeet = (first.x - second.x) * scale.feetAcross;
	const downFeet = (first.y - second.y) * scale.feetDown;
	return Math.hypot(acrossFeet, downFeet);
}

export function fractionAcrossForFeet(scale: LayoutScale, feet: number) {
	return feet / scale.feetAcross;
}

export function fractionDownForFeet(scale: LayoutScale, feet: number) {
	return feet / scale.feetDown;
}

export function acresOfFraction(plotAcres: number, fractionOfScene: number) {
	return plotAcres * fractionOfScene;
}
