import { feetToNearestEdge } from '../layout/distanceToEdge';
import { feetBetween, layoutScaleFor, type LayoutScale } from '../layout/layoutScale';
import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { waterAcres } from '../layout/waterArea';
import { drawnBankOf } from './shoreline/drawnBank';

export interface ShorelineChange {
	feetMoved: number;
	acresAdded: number;
	acresChanged: number;
}

const UntouchedWithinFeet = 3;
const DrawnBankSpacingFeet = 8;

export function shorelineChangeFor(oldOutline: LayoutPoint[], newOutline: LayoutPoint[], layout: LakeLayout, plotAcres: number): ShorelineChange {
	const scale = layoutScaleFor(plotAcres);
	const feet = (first: LayoutPoint, second: LayoutPoint) => feetBetween(scale, first, second);
	const readings = [oldOutline, drawnBankOf(oldOutline, DrawnBankSpacingFeet, feet)];
	const changes = readings.map((reading) => changeFrom(reading, newOutline, layout, plotAcres));
	return changes.reduce((least, change) => (change.feetMoved < least.feetMoved ? change : least));
}

function changeFrom(oldOutline: LayoutPoint[], newOutline: LayoutPoint[], layout: LakeLayout, plotAcres: number): ShorelineChange {
	const scale = layoutScaleFor(plotAcres);
	const feetMoved = newOutline.reduce((total, vertex, index) => total + reworkedFeet(oldOutline, vertex, newOutline[(index + 1) % newOutline.length], scale), 0);
	const before = waterAcres({ ...layout, outline: oldOutline }, plotAcres);
	const after = waterAcres({ ...layout, outline: newOutline }, plotAcres);
	const acresChanged = Math.round((after - before) * 100) / 100;
	return { feetMoved: Math.round(feetMoved), acresAdded: Math.max(0, acresChanged), acresChanged };
}

function reworkedFeet(oldOutline: LayoutPoint[], start: LayoutPoint, end: LayoutPoint, scale: LayoutScale) {
	const isStartMoved = feetToNearestEdge(scale, start, oldOutline) > UntouchedWithinFeet;
	const isEndMoved = feetToNearestEdge(scale, end, oldOutline) > UntouchedWithinFeet;
	return isStartMoved || isEndMoved ? feetBetween(scale, start, end) : 0;
}
