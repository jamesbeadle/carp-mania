import { biteRollFor, biteTimeOf, type BiteRoll, type WaterToday } from '$lib/domain/fishing/biteRoll';
import { matchTackleToWater, type TackleMatch } from '$lib/domain/fishing/tackleMatch';
import type { Lake } from '$lib/domain/types';
import type { CastRod } from '../scene/rodState';

export interface RolledBite {
	rodIndex: number;
	hour: number;
	roll: BiteRoll;
}

export class BiteRoller {
	private readonly rolledByRod = new Map<number, RolledBite>();
	private readonly spentBites = new Set<string>();
	private readonly seed: number;
	private readonly water: WaterToday;

	constructor(seed: number, water: WaterToday) {
		this.seed = seed;
		this.water = water;
	}

	rollAfterCast(rod: CastRod, clockHour: number): RolledBite {
		const hour = Math.floor(clockHour);
		const roll = biteRollFor(this.seed, rod.index, hour, { terrain: rod.terrain, setup: rod.setup }, this.water);
		const rolled = { rodIndex: rod.index, hour, roll };
		this.rolledByRod.set(rod.index, rolled);
		return rolled;
	}

	biteDueOn(rod: CastRod, clockHour: number): RolledBite | null {
		const rolled = this.rolledFor(rod, clockHour);
		const isDue = rolled.roll.isTaking && clockHour >= biteTimeOf(rolled.hour, rolled.roll);
		if (!isDue || this.spentBites.has(keyOf(rolled))) return null;
		this.spentBites.add(keyOf(rolled));
		return rolled;
	}

	private rolledFor(rod: CastRod, clockHour: number): RolledBite {
		const cached = this.rolledByRod.get(rod.index);
		if (cached && cached.hour === Math.floor(clockHour)) return cached;
		return this.rollAfterCast(rod, clockHour);
	}
}

function keyOf(bite: RolledBite) {
	return `${bite.rodIndex}:${bite.hour}`;
}

export function tackleMatchFor(lake: Lake, rod: CastRod): TackleMatch {
	return matchTackleToWater(rod.setup, lake, rod.terrain);
}
