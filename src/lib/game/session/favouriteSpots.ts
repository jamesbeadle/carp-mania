import { sameChanceForEveryFish, type TakeBonus } from '$lib/domain/fishing/pickCarp';
import { favouriteSpotOf, FavouriteSpotBiteBonus, isCastAtFavourite } from '$lib/domain/layout/favouriteFeature';
import type { Carp, Lake } from '$lib/domain/types';
import type { Season } from '$lib/domain/world/seasons';
import { castPointOf, isCastOut, type CastRod, type RodOnBank } from '../scene/rodState';

const NoBonus = 1;

export function favouriteSpotBonusFor(lake: Lake, season: Season, rod: RodOnBank): TakeBonus {
	if (!isCastOut(rod)) return sameChanceForEveryFish;
	return (carp) => (isRodOnFavouriteSpotOf(carp, lake, season, rod) ? FavouriteSpotBiteBonus : NoBonus);
}

function isRodOnFavouriteSpotOf(carp: Carp, lake: Lake, season: Season, rod: CastRod) {
	const favourite = favouriteSpotOf(carp, lake.layout, season.isWinter);
	return isCastAtFavourite(favourite, rod.terrain, castPointOf(rod), lake.layout);
}
