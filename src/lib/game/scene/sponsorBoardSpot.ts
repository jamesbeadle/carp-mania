import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { lakeCentreOf, toScene, type Point } from './lakeShape';

const Board = { Angle: (Math.PI * 5) / 6, BeyondTheBank: 34 } as const;

export function sponsorBoardSpotOf(layout: LakeLayout): Point {
	const centre = lakeCentreOf(layout);
	const bank = layout.outline.map(toScene);
	const nearest = bank.reduce<Point | null>((best, point) => (best === null || angleGap(point, centre) < angleGap(best, centre) ? point : best), null);
	const anchor = nearest ?? centre;
	const outward = Math.atan2(anchor.y - centre.y, anchor.x - centre.x);
	return { x: anchor.x + Math.cos(outward) * Board.BeyondTheBank, y: anchor.y + Math.sin(outward) * Board.BeyondTheBank };
}

function angleGap(point: Point, centre: Point) {
	const angle = Math.atan2(point.y - centre.y, point.x - centre.x);
	const gap = Math.abs(angle - Board.Angle) % (Math.PI * 2);
	return Math.min(gap, Math.PI * 2 - gap);
}
