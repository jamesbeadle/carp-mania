import { favouriteSpotOf, FavouriteSpotBiteBonus, isCastAtFavourite, ShownSpotBonus } from '../layout/favouriteFeature';
import type { LayoutPoint } from '../layout/layoutTypes';
import type { Terrain } from '../layout/terrainAt';
import { isFishable } from '../simulation/lapseTransfers';
import { kitFor, type RodKit, type RodSetup } from '../tackle/rodSetup';
import type { Carp, Lake } from '../types';
import type { Season } from '../world/seasons';
import { biteRollFor, type BiteRoll, type WaterToday } from './biteRoll';
import { castTerrainFor } from './castTerrain';
import { pickCarpByWeight } from './pickCarp';
import { kitAgeFactorFor } from './kitAgeFactor';
import { idsShownTruthfully, showsThisHour } from './showingFish';
import { NeutralConditionsShare, ratingShareOf, sizeReachOf, waterShareOf } from './sizeReach';
import { matchTackleToWater } from './tackleMatch';
import { takeWeightsFor, type SpotBonus } from './takeWeight';

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

export function sizeReachFor(water: WaterToday, carpCount: number, tackleMatchOverall: number) {
	return sizeReachOf({
		ratingShare: ratingShareOf(water.rating),
		tackleShare: tackleMatchOverall,
		conditionsShare: NeutralConditionsShare,
		waterShare: waterShareOf(water.lake, carpCount)
	});
}

export function carpThatTookTheBait(carpInOrder: Carp[], bite: Bite, water: WaterToday, spot: CastSpot): Carp | null {
	const match = matchTackleToWater(bite.kit, water.lake, spot.terrain);
	const shownIds = idsShownTruthfully(showsThisHour(bite.seed, bite.hour, carpInOrder, water.watercraft));
	const spotBonusFor = favouriteSpotBonusAt(water.lake, water.season, spot, shownIds);
	const kitFactorFor = kitAgeFactorFor(bite.kit, Number(water.lake.transparency));
	const take = { sizeReach: sizeReachFor(water, carpInOrder.length, match.overall), hour: bite.hour, spotBonusFor, kitFactorFor };
	return pickCarpByWeight(carpInOrder, takeWeightsFor(carpInOrder, take), bite.roll.carpIndexRoll);
}

export function carpForRolledBite(report: RolledBiteReport, water: WaterToday, carpInLake: Carp[]): Carp | null {
	const spot = { terrain: castTerrainFor(water.lake, report.castPoint), castPoint: report.castPoint };
	const rod = { terrain: spot.terrain, kit: kitFor(report.setup) };
	const roll = biteRollFor(report.seed, report.rodIndex, report.hour, rod, water);
	if (!roll.isTaking) return null;
	return carpThatTookTheBait(carpInBiteOrder(carpInLake), { roll, hour: report.hour, kit: rod.kit, seed: report.seed }, water, spot);
}

function byId(one: Carp, other: Carp) {
	if (one.id < other.id) return -1;
	return one.id > other.id ? 1 : 0;
}
