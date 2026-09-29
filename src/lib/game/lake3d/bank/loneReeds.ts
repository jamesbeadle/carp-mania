import { randomBetween, type RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { CoverPlant } from '../grass/coverScatter';
import type { ShoreField } from '../grass/shoreField';
import { ReedCells } from './reedAtlas';

const Lone = { PerMetre: 0.5, Across: 5.5, MostInland: 0.6, Deepest: -2.6, Heights: [1.2, 2.3], Width: [0.35, 0.55], Lean: 0.12 } as const;
const Look = { Darkest: 0.74, Range: 0.2, MostWarmth: 0.3, Reach: 8 } as const;

function loneReedAt(point: WorldPoint, random: RandomFraction): CoverPlant {
	const cell = random() < 1 / 2 ? ReedCells.Sparse : ReedCells.Emergent;
	const height = randomBetween(random, ...Lone.Heights);
	const tint = { shade: Look.Darkest + random() * Look.Range, warmth: random() * Look.MostWarmth };
	const shape = { height, width: height * randomBetween(random, ...Lone.Width), lean: (random() - 1 / 2) * Lone.Lean * 2 };
	return { point, cell, ...shape, turn: random() * Math.PI, tint, reach: Look.Reach, isMarginal: true };
}

export function loneReeds(line: WorldPoint[], shore: ShoreField, random: RandomFraction) {
	return line.slice(1).flatMap((end, index) => {
		const start = line[index];
		const length = Math.hypot(end.x - start.x, end.z - start.z);
		const points = Array.from({ length: Math.round(length * Lone.PerMetre) }, () => {
			const share = random();
			return { x: start.x + (end.x - start.x) * share + (random() * 2 - 1) * Lone.Across, z: start.z + (end.z - start.z) * share + (random() * 2 - 1) * Lone.Across };
		});
		const inTheMargin = points.filter((point) => shore.distanceAt(point) < Lone.MostInland && shore.distanceAt(point) > Lone.Deepest);
		return inTheMargin.map((point) => loneReedAt(point, random));
	});
}
