import { BrandCatalogue } from '../tackle/brands';
import { perTermFor, sponsorTierFor } from './offerAmounts';
import { whatSponsorsStillWant, type WaterStanding } from './waterStanding';
import { termWords, type SponsorshipOffer } from './lakeSponsorship';

export function offerHeadline(offer: Pick<SponsorshipOffer, 'brand' | 'termMonths'>) {
	return `${BrandCatalogue[offer.brand].label} — ${termWords(offer.termMonths)} on the boards`;
}

export function whatOffersDependOn(standing: WaterStanding) {
	const stillWanted = whatSponsorsStillWant(standing);
	if (stillWanted.length > 0) return `Brands write to a water with standing. This one still needs ${stillWanted.join(', ')}. The rating is reputation for the most part and water quality for the rest.`;
	const { waterRating } = standing;
	const tier = sponsorTierFor(waterRating);
	return `This water rates ${Math.round(waterRating)}: brands up to the ${tier} tier write, at about £${perTermFor(waterRating).toLocaleString('en-GB')} for every six months. A better water draws bigger names and bigger money; a longer deal pays a little more for each term.`;
}
