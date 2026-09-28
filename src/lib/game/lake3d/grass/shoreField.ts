import type { WorldPoint } from '../lakeFrame';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';

export interface WaterEdges {
	outline: WorldPoint[];
	islands: WorldPoint[][];
}

export interface FieldArea {
	least: WorldPoint;
	most: WorldPoint;
}

const Field = { FewestMetresPerCell: 2, MostCellsAcross: 260, GradientStep: 0.5 } as const;

function signedShoreDistance(point: WorldPoint, water: WaterEdges) {
	const toEdge = Math.min(distanceToOutline(point, water.outline), ...water.islands.map((island) => distanceToOutline(point, island)));
	const isOnAnIsland = water.islands.some((island) => isInsideOutline(point, island));
	const isInWater = isInsideOutline(point, water.outline) && !isOnAnIsland;
	return isInWater ? -toEdge : toEdge;
}

export class ShoreField {
	private readonly metresPerCell: number;
	private readonly across: number;
	private readonly down: number;
	private readonly distances: Float32Array;

	constructor(private readonly area: FieldArea, water: WaterEdges) {
		const { least, most } = area;
		this.metresPerCell = Math.max(Field.FewestMetresPerCell, (most.x - least.x) / Field.MostCellsAcross);
		this.across = Math.ceil((most.x - least.x) / this.metresPerCell) + 1;
		this.down = Math.ceil((most.z - least.z) / this.metresPerCell) + 1;
		this.distances = new Float32Array(this.across * this.down);
		for (let row = 0; row < this.down; row++) this.fillRow(row, water);
	}

	distanceAt(point: WorldPoint) {
		const { least } = this.area;
		const column = Math.min(this.across - 1.001, Math.max(0, (point.x - least.x) / this.metresPerCell));
		const row = Math.min(this.down - 1.001, Math.max(0, (point.z - least.z) / this.metresPerCell));
		const left = Math.floor(column);
		const top = Math.floor(row);
		const shareAcross = column - left;
		const shareDown = row - top;
		const upper = this.valueAt(left, top) * (1 - shareAcross) + this.valueAt(left + 1, top) * shareAcross;
		const lower = this.valueAt(left, top + 1) * (1 - shareAcross) + this.valueAt(left + 1, top + 1) * shareAcross;
		return upper * (1 - shareDown) + lower * shareDown;
	}

	headingTowardTheWater(point: WorldPoint) {
		const step = Field.GradientStep;
		const across = this.distanceAt({ x: point.x + step, z: point.z }) - this.distanceAt({ x: point.x - step, z: point.z });
		const down = this.distanceAt({ x: point.x, z: point.z + step }) - this.distanceAt({ x: point.x, z: point.z - step });
		return Math.atan2(-down, -across);
	}

	private valueAt(column: number, row: number) {
		return this.distances[row * this.across + column];
	}

	private fillRow(row: number, water: WaterEdges) {
		const { least } = this.area;
		for (let column = 0; column < this.across; column++) {
			const point = { x: least.x + column * this.metresPerCell, z: least.z + row * this.metresPerCell };
			this.distances[row * this.across + column] = signedShoreDistance(point, water);
		}
	}
}
