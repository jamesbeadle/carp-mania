import type { Shelf, TackleShelves } from '$lib/contracts/TackleShelves';
import { BaitBrandCatalogue, BrandCatalogue, isTierAtOrBelow, WorldShopStocksUpTo, type BaitBrandName, type BrandName, type Tier } from '$lib/domain/tackle/brands';
import { TackleOnSale } from '$lib/domain/tackle/catalogue';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { creditWith, isSponsoredBy, type BrandCredit, type Sponsorship } from '$lib/domain/tackle/sponsorship';
import { loadRatingOf } from './loadAnglerRating';
import { loadBrandCredits, loadSponsorships } from './loadSponsorships';

const Brands = { ...BrandCatalogue, ...BaitBrandCatalogue };
const BrandNames = Object.keys(Brands) as (BrandName | BaitBrandName)[];

export async function GetTackleShelves(locals: App.Locals, stocksUpTo: Tier = WorldShopStocksUpTo): Promise<TackleShelves> {
	const user = requireUser(locals);
	const [rating, profile, sponsorships, credits] = await Promise.all([
		loadRatingOf(locals, user.id), loadProfile(locals), loadSponsorships(locals, user.id), loadBrandCredits(locals, user.id)
	]);
	const backing = { rating, sponsorships, credits, now: new Date() };
	const shelves = BrandNames.map((brand) => shelfFor(brand, backing)).filter((shelf) => isTierAtOrBelow(shelf.tier, stocksUpTo));
	return { shelves, rating, stocksUpTo, money: Number(profile.money) };
}

interface Backing {
	rating: number;
	sponsorships: Sponsorship[];
	credits: BrandCredit[];
	now: Date;
}

function shelfFor(brand: BrandName | BaitBrandName, backing: Backing): Shelf {
	const profile = Brands[brand];
	const isSponsored = isSponsoredBy(backing.sponsorships, brand, backing.now);
	return {
		brand,
		label: profile.label,
		tier: profile.tier,
		story: profile.story,
		minimumRating: profile.minimumRating,
		isUnlocked: isSponsored || backing.rating >= profile.minimumRating,
		isSponsored,
		credit: creditWith(backing.credits, brand),
		items: TackleOnSale.filter((item) => item.brand === brand)
	};
}
