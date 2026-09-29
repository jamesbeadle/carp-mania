import type { WorldPoint } from '../lakeFrame';
import { rasteriseShore, type RasterFrame } from '../terrain/shoreRaster';

export interface WaterEdges {
	outline: WorldPoint[];
	islands: WorldPoint[][];
}

export interface FieldArea {
	least: WorldPoint;
	most: WorldPoint;
}

const Field = { FewestMetresPerCell: 2, MostCellsAcross: 260, GradientStep: 0.5, FarthestMetres: 100 } as const;
const WaterTexel = 1;

function signedDistances(frame: RasterFrame, water: WaterEdges) {
	const raster = rasteriseShore(frame, [water.outline, ...water.islands], Field.FarthestMetres);
	return raster.distances.map((distance, texel) => (raster.isWater[texel] === WaterTexel ? -distance : distance));
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
		this.distances = signedDistances(this.cellCentres(), water);
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

	private cellCentres(): RasterFrame {
		const { least } = this.area;
		const halfCell = this.metresPerCell / 2;
		return { originX: least.x - halfCell, originZ: least.z - halfCell, texelMetres: this.metresPerCell, across: this.across, down: this.down };
	}
}
