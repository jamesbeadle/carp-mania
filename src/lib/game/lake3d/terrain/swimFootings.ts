import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import type { BankProfile } from './shoreProfile';

interface Footing {
	pod: WorldPoint;
	roomMetres: number;
}

const Footings = { ClearMetres: 0.12, LeastRoomMetres: 0.1, HeldMetres: 2.5, FadedMetres: 5, SteepestSlope: 0.7 } as const;

function heldProfile(natural: BankProfile, roomMetres: number): BankProfile {
	const fall = Math.min(natural.top - natural.base, roomMetres * Footings.SteepestSlope);
	return { base: natural.top - fall, top: natural.top, riseMetres: roomMetres };
}

export class SwimFootings {
	private readonly footings: Footing[];

	constructor(spots: WorldPoint[], distanceToShore: (point: WorldPoint) => number) {
		this.footings = spots.map((pod) => ({ pod, roomMetres: Math.max(Footings.LeastRoomMetres, distanceToShore(pod) - Footings.ClearMetres) }));
	}

	profileAt(point: WorldPoint, natural: BankProfile): BankProfile {
		return this.footings.reduce((chosen, { pod, roomMetres }) => {
			const away = Math.hypot(point.x - pod.x, point.z - pod.z);
			const hold = 1 - MathUtils.smoothstep(away, Footings.HeldMetres, Footings.FadedMetres);
			if (hold <= 0 || roomMetres >= natural.riseMetres) return chosen;
			const held = heldProfile(natural, roomMetres);
			const riseMetres = MathUtils.lerp(natural.riseMetres, held.riseMetres, hold);
			if (riseMetres >= chosen.riseMetres) return chosen;
			return { base: MathUtils.lerp(natural.base, held.base, hold), top: natural.top, riseMetres };
		}, natural);
	}
}
