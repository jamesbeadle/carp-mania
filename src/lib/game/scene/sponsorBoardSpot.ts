import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { spotOnTheBank } from './bankSpot';
import type { Point } from './lakeShape';

const Board = { Angle: (Math.PI * 5) / 6, BeyondTheBank: 34 } as const;

export function sponsorBoardSpotOf(layout: LakeLayout): Point {
	return spotOnTheBank(layout, Board.Angle, Board.BeyondTheBank);
}
