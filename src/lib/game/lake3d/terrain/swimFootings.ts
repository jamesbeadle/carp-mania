import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { Shore } from './shoreProfile';

interface Footing {
	pod: WorldPoint;
	dropShare: number;
}

const Footings = { ClearMetres: 0.12, LeastDropShare: 0.12, HeldMetres: 2.5, FadedMetres: 5 } as const;

export class SwimFootings {
	private readonly footings: Footing[];

	constructor(spots: WorldPoint[], distanceToShore: (point: WorldPoint) => number) {
		this.footings = spots.map((pod) => {
			const room = (distanceToShore(pod) - Footings.ClearMetres) / Shore.DropMetres;
			return { pod, dropShare: MathUtils.clamp(room, Footings.LeastDropShare, 1) };
		});
	}

	dropShareAt(point: WorldPoint) {
		return this.footings.reduce((share, { pod, dropShare }) => {
			const away = Math.hypot(point.x - pod.x, point.z - pod.z);
			const hold = 1 - MathUtils.smoothstep(away, Footings.HeldMetres, Footings.FadedMetres);
			return Math.min(share, MathUtils.lerp(1, dropShare, hold));
		}, 1);
	}
}
