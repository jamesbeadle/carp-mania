import { Facilities, type Facility, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import type { Swim } from '$lib/domain/types';
import { spotOnTheBank } from './bankSpot';
import { distanceBetween, type Point } from './lakeShape';
import { swimScenePoint } from '../render/drawSwims';

export interface FacilitySpot {
	facility: Facility;
	point: Point;
}

const Spread = { StartAngle: -Math.PI / 2, StepAngle: Math.PI / 12, BeyondTheBank: 30, ClearOfAPeg: 80, ClearOfEachOther: 40 } as const;
const CandidateCount = Math.round((Math.PI * 2) / Spread.StepAngle);

export function facilitySpotsOf(layout: LakeLayout, swims: Swim[]): FacilitySpot[] {
	const built = Facilities.filter((facility) => layout.facilities.includes(facility));
	const pegs = swims.map(swimScenePoint);
	const candidates = Array.from({ length: CandidateCount }, (_, index) => spotOnTheBank(layout, Spread.StartAngle + index * Spread.StepAngle, Spread.BeyondTheBank));
	const taken: Point[] = [];
	return built.map((facility) => {
		const point = candidates.find((candidate) => isClear(candidate, pegs, taken)) ?? candidates[taken.length % CandidateCount];
		taken.push(point);
		return { facility, point };
	});
}

function isClear(candidate: Point, pegs: Point[], taken: Point[]) {
	const isOffThePegs = pegs.every((peg) => distanceBetween(candidate, peg) >= Spread.ClearOfAPeg);
	const isOffTheOthers = taken.every((other) => distanceBetween(candidate, other) >= Spread.ClearOfEachOther);
	return isOffThePegs && isOffTheOthers;
}
