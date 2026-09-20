import type { LayoutPoint } from '../layout/layoutTypes';
import type { SceneDistance } from './bankAnchor';

const Arc = { ScenePixelsPerPoint: 28, FewestPoints: 3, LeastBulgeShareOfChord: 0.12 } as const;
const Chaikin = { Near: 0.25, Far: 0.75 } as const;

export function roundedStretch(from: LayoutPoint, to: LayoutPoint, removed: LayoutPoint[], lakeCentre: LayoutPoint, distance: SceneDistance): LayoutPoint[] {
	const chord = { x: to.x - from.x, y: to.y - from.y };
	const chordLength = Math.hypot(chord.x, chord.y);
	if (chordLength === 0) return [];
	const normal = { x: -chord.y / chordLength, y: chord.x / chordLength };
	const awayFromTheWater = (from.x - lakeCentre.x) * normal.x + (from.y - lakeCentre.y) * normal.y >= 0 ? 1 : -1;
	const bulge = bulgeOf(from, removed, normal, chordLength, awayFromTheWater);
	const middle = { x: (from.x + to.x) / 2 + normal.x * bulge, y: (from.y + to.y) / 2 + normal.y * bulge };
	const control = { x: 2 * middle.x - (from.x + to.x) / 2, y: 2 * middle.y - (from.y + to.y) / 2 };
	const count = Math.max(Arc.FewestPoints, Math.round(distance(from, to) / Arc.ScenePixelsPerPoint));
	return Array.from({ length: count }, (_, index) => alongTheCurve(from, control, to, (index + 1) / (count + 1)));
}

export function softenedPath(from: LayoutPoint, path: LayoutPoint[], to: LayoutPoint): LayoutPoint[] {
	const whole = [from, ...path, to];
	const softened: LayoutPoint[] = [];
	for (let index = 0; index < whole.length - 1; index++) {
		const start = whole[index];
		const end = whole[index + 1];
		softened.push(between(start, end, Chaikin.Near), between(start, end, Chaikin.Far));
	}
	return softened.slice(1, -1);
}

function bulgeOf(from: LayoutPoint, removed: LayoutPoint[], normal: LayoutPoint, chordLength: number, awayFromTheWater: number) {
	const offsets = removed.map((vertex) => (vertex.x - from.x) * normal.x + (vertex.y - from.y) * normal.y);
	const average = offsets.length > 0 ? offsets.reduce((total, offset) => total + offset, 0) / offsets.length : 0;
	const least = chordLength * Arc.LeastBulgeShareOfChord;
	if (Math.abs(average) >= least) return average;
	return least * awayFromTheWater;
}

function alongTheCurve(from: LayoutPoint, control: LayoutPoint, to: LayoutPoint, share: number): LayoutPoint {
	const remaining = 1 - share;
	return {
		x: remaining * remaining * from.x + 2 * remaining * share * control.x + share * share * to.x,
		y: remaining * remaining * from.y + 2 * remaining * share * control.y + share * share * to.y
	};
}

function between(start: LayoutPoint, end: LayoutPoint, share: number): LayoutPoint {
	return { x: start.x + (end.x - start.x) * share, y: start.y + (end.y - start.y) * share };
}
