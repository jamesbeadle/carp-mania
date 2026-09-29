import { seededRandom } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { CoverPalettes } from './coverPalette';
import { scatterTile, Tile, type CoverPlant, type Scattering } from './coverScatter';
import { CoverSites, type CoverGround } from './coverSite';
import type { FieldArea } from './shoreField';

export const Seeding = { ColumnStride: 4096 } as const;

export class CoverTiles {
	private readonly sites: CoverSites;
	private readonly flowerShare: number;
	private readonly plantsByTile = new Map<string, CoverPlant[]>();

	constructor(
		private readonly ground: CoverGround,
		private readonly area: FieldArea,
		private readonly density: number
	) {
		this.sites = new CoverSites(ground);
		const { flowerShare } = CoverPalettes[ground.season];
		this.flowerShare = flowerShare;
	}

	plantsIn(column: number, row: number): CoverPlant[] {
		const key = `${column}:${row}`;
		const known = this.plantsByTile.get(key);
		if (known) return known;
		const plants = this.scatter(column, row);
		this.plantsByTile.set(key, plants);
		return plants;
	}

	private scatter(column: number, row: number): CoverPlant[] {
		const corner = { x: column * Tile.Metres, z: row * Tile.Metres };
		if (!this.isInTheArea(corner) || !this.isNearTheShore(corner)) return [];
		const { seed } = this.ground;
		const random = seededRandom(seed + column * Seeding.ColumnStride + row);
		const scattering: Scattering = { sites: this.sites, flowerShare: this.flowerShare, density: this.density, mostDensity: 0, random };
		const plants: CoverPlant[] = [];
		scatterTile(corner, scattering, plants);
		return plants;
	}

	private isInTheArea(corner: WorldPoint) {
		const { least, most } = this.area;
		const isAcross = corner.x + Tile.Metres > least.x && corner.x < most.x;
		const isDown = corner.z + Tile.Metres > least.z && corner.z < most.z;
		return isAcross && isDown;
	}

	private isNearTheShore(corner: WorldPoint) {
		const { shore } = this.ground;
		const distance = shore.distanceAt({ x: corner.x + Tile.Metres / 2, z: corner.z + Tile.Metres / 2 });
		return distance > Tile.NearestShore && distance < Tile.FarthestShore;
	}
}
