import type { WorldPoint } from '../lakeFrame';
import { ShoreIndex } from '../terrain/shoreIndex';
import { isInsideOutline } from '../worldGeometry';

export class WaterEdge {
	private constructor(
		private readonly ring: WorldPoint[],
		private readonly shore: ShoreIndex,
		private readonly reachMetres: number,
		private readonly isLandInsideTheRing: boolean
	) {}

	static aroundTheLake(outline: WorldPoint[], reachMetres: number) {
		return new WaterEdge(outline, new ShoreIndex(outline, [], reachMetres), reachMetres, false);
	}

	static aroundAnIsland(points: WorldPoint[], reachMetres: number) {
		return new WaterEdge(points, new ShoreIndex([], [points], reachMetres), reachMetres, true);
	}

	metresFromWater(point: WorldPoint) {
		const hit = this.shore.nearest(point, this.reachMetres);
		return hit ? hit.distance : this.reachMetres;
	}

	isOnLand(point: WorldPoint) {
		const hit = this.shore.nearest(point, this.reachMetres);
		if (hit) return !hit.isWater;
		return isInsideOutline(point, this.ring) === this.isLandInsideTheRing;
	}
}
