import { BrandCatalogue } from '../tackle/brands';
import { OfferMoney, perTermFor, sponsorTierFor } from './offerAmounts';
import { termWords, type SponsorshipOffer } from './lakeSponsorship';

export function offerHeadline(offer: Pick<SponsorshipOffer, 'brand' | 'termMonths'>) {
	return `${BrandCatalogue[offer.brand].label} — ${termWords(offer.termMonths)} on the boards`;
}

export function whatOffersDependOn(waterRating: number) {
	if (waterRating < OfferMoney.LeastWaterRating) return `Brands start writing once the water rates ${OfferMoney.LeastWaterRating} — reputation counts for most of it, water quality for the rest. This water rates ${Math.round(waterRating)}.`;
	const tier = sponsorTierFor(waterRating);
	return `This water rates ${Math.round(waterRating)}: brands up to the ${tier} tier write, at about £${perTermFor(waterRating).toLocaleString('en-GB')} for every six months. A better water draws bigger names and bigger money; a longer deal pays a little more for each term.`;
}
