import type { LayoutPoint } from '../../layout/layoutTypes';
import type { SceneDistance } from '../bankAnchor';
import { between } from './bankSpacing';

const FewestOutlinePoints = 3;

function alongTheCurve(start: LayoutPoint, control: LayoutPoint, end: LayoutPoint, share: number): LayoutPoint {
	const towardsControl = between(start, control, share);
	const fromControl = between(control, end, share);
	return between(towardsControl, fromControl, share);
}

export function drawnBankOf(outline: LayoutPoint[], spacing: number, distance: SceneDistance): LayoutPoint[] {
	const count = outline.length;
	if (count < FewestOutlinePoints) return outline;
	return outline.flatMap((control, index) => {
		const start = between(outline[(index - 1 + count) % count], control, 0.5);
		const end = between(control, outline[(index + 1) % count], 0.5);
		const pieces = Math.max(1, Math.round((distance(start, control) + distance(control, end)) / spacing));
		return Array.from({ length: pieces }, (_, piece) => alongTheCurve(start, control, end, piece / pieces));
	});
}
