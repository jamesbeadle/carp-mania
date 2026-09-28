import { MathUtils } from 'three';
import type { WorldPoint } from '../lakeFrame';
import type { BankProfile } from './shoreProfile';

const Footings = { FaceMetres: 0.45, HeldMetres: 2.5, FadedMetres: 5 } as const;

export class SwimFootings {
	constructor(private readonly spots: WorldPoint[]) {}

	profileAt(point: WorldPoint, natural: BankProfile): BankProfile {
		const nearest = this.spots.reduce((closest, spot) => Math.min(closest, Math.hypot(point.x - spot.x, point.z - spot.z)), Infinity);
		const hold = 1 - MathUtils.smoothstep(nearest, Footings.HeldMetres, Footings.FadedMetres);
		const heldRise = Math.min(natural.riseMetres, Footings.FaceMetres);
		return { base: natural.base, top: natural.top, riseMetres: MathUtils.lerp(natural.riseMetres, heldRise, hold) };
	}
}
