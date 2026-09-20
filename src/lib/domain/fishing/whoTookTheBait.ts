import { favouriteSpotOf, FavouriteSpotBiteBonus, isCastAtFavourite, ShownSpotBonus } from '../layout/favouriteFeature';
import type { LayoutPoint } from '../layout/layoutTypes';
import type { Terrain } from '../layout/terrainAt';
import { isFishable } from '../simulation/lapseTransfers';
import { kitFor, type RodKit, type RodSetup } from '../tackle/rodSetup';
import type { Carp, Lake } from '../types';
import type { Season } from '../world/seasons';
import { biteRollFor, type BiteRoll, type WaterToday } from './biteRoll';
import { castTerrainFor } from './castTerrain';
import { kitAgeFactorFor } from './kitAgeFactor';
import { idsShownTruthfully, showsThisHour } from './showingFish';
import { ratingShareOf, sizeReachOf, waterShareOf } from './sizeReach';
import { conditionsShareFor } from './weatherConditions';
import { matchTackleToWater } from './tackleMatch';
import { carpOfTaker, takerThatTookTheBait, type Taker } from './takers';
import { headCountOf } from '../stock/shoals';
import { pressureWariness } from '../water/pressure';
import type { SpotBonus } from './takeWeight';

const NoBonus = 1;

export interface CastSpot {
	terrain: Terrain;
	castPoint: LayoutPoint;
}

export interface RolledBiteReport {
	seed: number;
	rodIndex: number;
	hour: number;
	castPoint: LayoutPoint;
	setup: RodSetup;
}

export interface Bite {
	roll: BiteRoll;
	hour: number;
	kit: RodKit;
	seed: number;
}

export function carpInBiteOrder(carpInLake: Carp[]): Carp[] {
	return carpInLake.filter(isFishable).sort(byId);
}

export function favouriteSpotBonusAt(lake: Pick<Lake, 'layout'>, season: Pick<Season, 'isWinter'>, spot: CastSpot, shownIds: Set<string>): SpotBonus {
	return (carp) => {
		const favourite = favouriteSpotOf(carp, lake.layout, season.isWinter);
		if (!isCastAtFavourite(favourite, spot.terrain, spot.castPoint, lake.layout)) return NoBonus;
		return shownIds.has(carp.id) ? ShownSpotBonus : FavouriteSpotBiteBonus;
	};
}

export function sizeReachSharesFor(water: WaterToday, carpCount: number, tackleMatchOverall: number, hour: number) {
	return {
		ratingShare: ratingShareOf(water.rating),
		tackleShare: tackleMatchOverall,
		conditionsShare: conditionsShareFor(hour, water.weather),
		waterShare: waterShareOf(water.lake, carpCount)
	};
}

export function sizeReachFor(water: WaterToday, carpCount: number, tackleMatchOverall: number, hour: number) {
	return sizeReachOf(sizeReachSharesFor(water, carpCount, tackleMatchOverall, hour));
}

export function takerOfTheBait(carpInOrder: Carp[], bite: Bite, water: WaterToday, spot: CastSpot): Taker | null {
	const match = matchTackleToWater(bite.kit, water.lake, spot.terrain);
	const shownIds = idsShownTruthfully(showsThisHour(bite.seed, bite.hour, carpInOrder, water.watercraft));
	const spotBonusFor = favouriteSpotBonusAt(water.lake, water.season, spot, shownIds);
	const kitFactorFor = kitAgeFactorFor(bite.kit, Number(water.lake.transparency));
	const mouths = carpInOrder.length + headCountOf(water.shoals);
	const sizeReach = sizeReachFor(water, mouths, match.overall, bite.hour);
	const warinessFor = (carp: Pick<Carp, 'id'>) => pressureWariness(water.recentCaptures[carp.id] ?? 0);
	const take = { sizeReach, hour: bite.hour, spotBonusFor, kitFactorFor, warinessFor };
	const roll = bite.roll.carpIndexRoll;
	const { region } = water.lake;
	return takerThatTookTheBait(carpInOrder, water.shoals, take, roll, region, carpInOrder.length);
}

export function takerForRolledBite(report: RolledBiteReport, water: WaterToday, carpInLake: Carp[]): Taker | null {
	const spot = { terrain: castTerrainFor(water.lake, report.castPoint), castPoint: report.castPoint };
	const rod = { terrain: spot.terrain, kit: kitFor(report.setup) };
	const roll = biteRollFor(report.seed, report.rodIndex, report.hour, rod, water);
	if (!roll.isTaking) return null;
	return takerOfTheBait(carpInBiteOrder(carpInLake), { roll, hour: report.hour, kit: rod.kit, seed: report.seed }, water, spot);
}

export function carpForRolledBite(report: RolledBiteReport, water: WaterToday, carpInLake: Carp[]): Carp | null {
	return carpOfTaker(takerForRolledBite(report, water, carpInLake));
}

function byId(one: Carp, other: Carp) {
	if (one.id < other.id) return -1;
	return one.id > other.id ? 1 : 0;
}
