import { seededRandom } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';

export interface Field {
	least: WorldPoint;
	most: WorldPoint;
	crop: number;
}

export interface HedgeLine {
	from: WorldPoint;
	to: WorldPoint;
}

export const FieldTile = { Metres: 1500, Offset: 530 } as const;
const Sizes = { LeastWidth: 190, WidthRange: 170, LeastDepth: 150, DepthRange: 180 } as const;
const CropShares = [0.45, 0.2, 0.2, 0.15];

function splitsOf(total: number, least: number, range: number, random: () => number) {
	const edges = [0];
	let position = 0;
	while (position + least + range < total) {
		position += least + random() * range;
		edges.push(position);
	}
	return [...edges, total];
}

function cropFor(roll: number) {
	let reached = 0;
	const index = CropShares.findIndex((share) => (reached += share) > roll);
	return Math.max(0, index);
}

function shifted(line: HedgeLine, across: number, down: number): HedgeLine {
	const { from, to } = line;
	return { from: { x: from.x + across, z: from.z + down }, to: { x: to.x + across, z: to.z + down } };
}

export class FieldPattern {
	readonly fields: Field[] = [];
	readonly hedges: HedgeLine[] = [];

	constructor(seed: number) {
		const random = seededRandom(seed);
		const columns = splitsOf(FieldTile.Metres, Sizes.LeastWidth, Sizes.WidthRange, random);
		columns.slice(1).forEach((right, index) => this.layColumn(columns[index], right, random));
	}

	hedgesWithin(reach: number) {
		const firstTile = Math.floor((FieldTile.Offset - reach) / FieldTile.Metres);
		const lastTile = Math.floor((FieldTile.Offset + reach) / FieldTile.Metres);
		const lines: HedgeLine[] = [];
		for (let across = firstTile; across <= lastTile; across++) {
			for (let down = firstTile; down <= lastTile; down++) lines.push(...this.hedges.map((line) => shifted(line, across * FieldTile.Metres - FieldTile.Offset, down * FieldTile.Metres - FieldTile.Offset)));
		}
		return lines;
	}

	private layColumn(left: number, right: number, random: () => number) {
		const rows = splitsOf(FieldTile.Metres, Sizes.LeastDepth, Sizes.DepthRange, random);
		this.hedges.push({ from: { x: left, z: 0 }, to: { x: left, z: FieldTile.Metres } });
		rows.slice(1).forEach((bottom, index) => {
			const top = rows[index];
			this.fields.push({ least: { x: left, z: top }, most: { x: right, z: bottom }, crop: cropFor(random()) });
			this.hedges.push({ from: { x: left, z: top }, to: { x: right, z: top } });
		});
	}
}
