import { favouriteSpotOf, FavouriteSpotBiteBonus, isCastAtFavourite } from '../layout/favouriteFeature';
import type { LayoutPoint } from '../layout/layoutTypes';
import type { Terrain } from '../layout/terrainAt';
import { isFishable } from '../simulation/lapseTransfers';
import type { RodSetup } from '../tackle/rodSetup';
import type { Carp, Lake } from '../types';
import type { Season } from '../world/seasons';
import { biteRollFor, type BiteRoll, type WaterToday } from './biteRoll';
import { castTerrainFor } from './castTerrain';
import { pickCarpThatTookTheBait, type TakeBonus } from './pickCarp';

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

export function carpInBiteOrder(carpInLake: Carp[]): Carp[] {
	return carpInLake.filter(isFishable).sort(byId);
}

export function favouriteSpotBonusAt(lake: Pick<Lake, 'layout'>, season: Pick<Season, 'isWinter'>, spot: CastSpot): TakeBonus {
	return (carp) => {
		const favourite = favouriteSpotOf(carp, lake.layout, season.isWinter);
		return isCastAtFavourite(favourite, spot.terrain, spot.castPoint, lake.layout) ? FavouriteSpotBiteBonus : NoBonus;
	};
}

export function carpThatTookTheBait(carpInOrder: Carp[], roll: BiteRoll, water: Pick<WaterToday, 'lake' | 'season'>, spot: CastSpot): Carp | null {
	return pickCarpThatTookTheBait(carpInOrder, roll.carpIndexRoll, favouriteSpotBonusAt(water.lake, water.season, spot));
}

export function carpForRolledBite(report: RolledBiteReport, water: WaterToday, carpInLake: Carp[]): Carp | null {
	const spot = { terrain: castTerrainFor(water.lake, report.castPoint), castPoint: report.castPoint };
	const roll = biteRollFor(report.seed, report.rodIndex, report.hour, { terrain: spot.terrain, setup: report.setup }, water);
	if (!roll.isTaking) return null;
	return carpThatTookTheBait(carpInBiteOrder(carpInLake), roll, water, spot);
}

function byId(one: Carp, other: Carp) {
	if (one.id < other.id) return -1;
	return one.id > other.id ? 1 : 0;
}
