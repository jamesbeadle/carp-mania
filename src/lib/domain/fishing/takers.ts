import { drawFishFromShoal, type NewNamedFish } from '../stock/individualise';
import { isShoalFishable, representativeOf, type Shoal } from '../stock/shoals';
import type { Carp } from '../types';
import type { RegionCode } from '../world/regionCodes';
import { pickCarpByWeight } from './pickCarp';
import { takeWeightOf, type Take } from './takeWeight';

export type Taker = { kind: 'named'; carp: Carp } | { kind: 'shoal'; shoal: Shoal; fish: NewNamedFish; hour: number };

export function shoalTakeWeight(shoal: Shoal, take: Take) {
	return shoal.count * takeWeightOf(representativeOf(shoal), take);
}

export function takerThatTookTheBait(carp: Carp[], shoals: Shoal[], take: Take, roll: number, region: RegionCode, namedCount: number): Taker | null {
	const fishable = shoals.filter(isShoalFishable);
	const candidates = [...carp, ...fishable.map(representativeOf)];
	const weights = [...carp.map((fish) => takeWeightOf(fish, take)), ...fishable.map((shoal) => shoalTakeWeight(shoal, take))];
	const picked = pickCarpByWeight(candidates, weights, roll);
	if (!picked) return null;
	const shoal = fishable.find((candidate) => candidate.id === picked.id);
	if (!shoal) return { kind: 'named', carp: picked };
	return { kind: 'shoal', shoal, fish: drawFishFromShoal(shoal, secondRollFrom(roll), namedCount, region), hour: take.hour };
}

export function carpOfTaker(taker: Taker | null): Carp | null {
	if (!taker) return null;
	if (taker.kind === 'named') return taker.carp;
	return { ...taker.fish, id: provisionalIdFor(taker.shoal, taker.hour) };
}

export function isProvisionalId(id: string) {
	return id.startsWith(ProvisionalPrefix);
}

export function shoalIdOfProvisional(id: string) {
	return id.slice(ProvisionalPrefix.length).split(ProvisionalSeparator)[0];
}

const ProvisionalPrefix = 'shoal:';
const ProvisionalSeparator = ':';
const SecondRollStride = 9973;

function provisionalIdFor(shoal: Shoal, hour: number) {
	return `${ProvisionalPrefix}${shoal.id}${ProvisionalSeparator}${hour}`;
}

function secondRollFrom(roll: number) {
	const scaled = roll * SecondRollStride;
	return scaled - Math.floor(scaled);
}
