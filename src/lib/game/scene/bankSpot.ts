import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { lakeCentreOf, toScene, type Point } from './lakeShape';

const FullTurn = Math.PI * 2;

export function spotOnTheBank(layout: LakeLayout, wantedAngle: number, beyondTheBank: number): Point {
	const centre = lakeCentreOf(layout);
	const bank = layout.outline.map(toScene);
	const gapOf = (point: Point) => angleGap(angleFrom(centre, point), wantedAngle);
	const nearest = bank.reduce<Point | null>((best, point) => (best === null || gapOf(point) < gapOf(best) ? point : best), null);
	const anchor = nearest ?? centre;
	return pointBeyond(anchor, angleFrom(centre, anchor), beyondTheBank);
}

function angleFrom(centre: Point, point: Point) {
	return Math.atan2(point.y - centre.y, point.x - centre.x);
}

function angleGap(angle: number, wantedAngle: number) {
	const gap = Math.abs(angle - wantedAngle) % FullTurn;
	return Math.min(gap, FullTurn - gap);
}

function pointBeyond(anchor: Point, angle: number, distance: number): Point {
	const across = Math.cos(angle) * distance;
	const down = Math.sin(angle) * distance;
	return { x: anchor.x + across, y: anchor.y + down };
}
