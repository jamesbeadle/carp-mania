import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';

const CandidatesPerShoreSquareMetre = 0.0149;
const FullTurn = Math.PI * 2;

function shoreLengthOf(outline: WorldPoint[]) {
	return outline.reduce((total, point, index) => {
		const next = outline[(index + 1) % outline.length];
		return total + Math.hypot(next.x - point.x, next.z - point.z);
	}, 0);
}

function nearTheShore(outline: WorldPoint[], reach: number, random: RandomFraction): WorldPoint {
	const index = Math.floor(random() * outline.length);
	const start = outline[index];
	const end = outline[(index + 1) % outline.length];
	const share = random();
	const heading = random() * FullTurn;
	const distance = random() * reach;
	return { x: start.x + (end.x - start.x) * share + Math.cos(heading) * distance, z: start.z + (end.z - start.z) * share + Math.sin(heading) * distance };
}

export function shoreCandidates(outline: WorldPoint[], reach: number, random: RandomFraction) {
	const count = Math.round(shoreLengthOf(outline) * reach * CandidatesPerShoreSquareMetre);
	return Array.from({ length: count }, () => nearTheShore(outline, reach, random));
}
