import type { Shelf, TackleShelves } from '$lib/contracts/TackleShelves';
import { BaitBrandCatalogue, BrandCatalogue, isTierAtOrBelow, WorldShopStocksUpTo, type BaitBrandName, type BrandName, type Tier } from '$lib/domain/tackle/brands';
import { TackleCatalogue } from '$lib/domain/tackle/catalogue';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { loadRatingOf } from './loadAnglerRating';

const Brands = { ...BrandCatalogue, ...BaitBrandCatalogue };
const BrandNames = Object.keys(Brands) as (BrandName | BaitBrandName)[];

export async function GetTackleShelves(locals: App.Locals, stocksUpTo: Tier = WorldShopStocksUpTo): Promise<TackleShelves> {
	const user = requireUser(locals);
	const [rating, profile] = await Promise.all([loadRatingOf(locals, user.id), loadProfile(locals)]);
	const shelves = BrandNames.map((brand) => shelfFor(brand, rating)).filter((shelf) => isTierAtOrBelow(shelf.tier, stocksUpTo));
	return { shelves, rating, stocksUpTo, money: Number(profile.money) };
}

function shelfFor(brand: BrandName | BaitBrandName, rating: number): Shelf {
	const profile = Brands[brand];
	return {
		brand,
		label: profile.label,
		tier: profile.tier,
		story: profile.story,
		minimumRating: profile.minimumRating,
		isUnlocked: rating >= profile.minimumRating,
		items: TackleCatalogue.filter((item) => item.brand === brand)
	};
}
