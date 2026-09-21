import assert from 'node:assert/strict';
import { isOfferOpen, isTermMonths, sponsorOnTheBoards, termWords } from '../src/lib/domain/sponsorship/lakeSponsorship';
import { BrandMoneyFactor, brandsThatWouldSponsor, isWaterWorthSponsoring, offerAmountFor, perTermFor } from '../src/lib/domain/sponsorship/offerAmounts';
import { drawOffer, isOpenToOffers, offersOverDays } from '../src/lib/domain/sponsorship/offerDraw';
import { seededRandom } from '../src/lib/domain/random';

export function runSponsorshipScenarios() {
	assert.ok(!isWaterWorthSponsoring(29) && isWaterWorthSponsoring(30), 'brands write from a water rating of 30');
	assert.equal(perTermFor(30), 2000, 'a modest water is offered two thousand for six months');
	assert.equal(perTermFor(100), 60000, 'the best water in the world is offered sixty thousand for six months');
	assert.ok(perTermFor(65) > perTermFor(50) && perTermFor(50) > perTermFor(35), 'offers climb with the water');
	assert.ok(offerAmountFor(50, 36, 'marlow') > offerAmountFor(50, 6, 'marlow') * 6, 'three years pays more than six six-month deals');
	assert.ok(offerAmountFor(90, 6, 'blackmere') > offerAmountFor(90, 6, 'bankside_basics'), 'a custom brand pays more than a supermarket one');
	assert.deepEqual(brandsThatWouldSponsor(35), ['bankside_basics', 'tench_and_sons'], 'a modest water hears only from starter brands');
	assert.ok(brandsThatWouldSponsor(90).includes('blackmere'), 'a superb water hears from the custom brands');
	assert.ok(isTermMonths(6) && isTermMonths(36) && !isTermMonths(9) && !isTermMonths(42), 'terms are six-month steps up to three years');
	assert.equal(termWords(6), '6 months');
	assert.equal(termWords(12), 'a year');
	assert.equal(termWords(24), '2 years');
	const now = new Date('2026-09-21T12:00:00Z');
	const later = new Date('2026-09-22T12:00:00Z');
	assert.ok(isOfferOpen({ status: 'open', expiresAt: later.toISOString() }, now) && !isOfferOpen({ status: 'open', expiresAt: later.toISOString() }, new Date('2026-09-23T00:00:00Z')), 'an offer is open until it expires');
	assert.equal(sponsorOnTheBoards({ sponsor_brand: 'marlow', sponsored_until: later.toISOString() }, now), 'marlow');
	assert.equal(sponsorOnTheBoards({ sponsor_brand: 'marlow', sponsored_until: now.toISOString() }, later), null, 'a lapsed deal comes off the boards');
	const deal = { id: 'deal', lakeId: 'lake', brand: 'marlow' as const, termMonths: 12, amount: 9000, signedAt: now.toISOString(), runsUntil: new Date(now.getTime() + 200 * 60 * 60 * 1000).toISOString() };
	assert.ok(!isOpenToOffers({ deal, offers: [] }, now), 'no offers while a deal has months to run');
	assert.ok(isOpenToOffers({ deal, offers: [] }, new Date(deal.runsUntil).valueOf() - 10 * 60 * 60 * 1000 > now.getTime() ? new Date(new Date(deal.runsUntil).getTime() - 10 * 60 * 60 * 1000) : now), 'renewal offers come in the last month');
	const offer = { id: 'o', lakeId: 'lake', brand: 'marlow' as const, termMonths: 6, amount: 4000, offeredAt: now.toISOString(), expiresAt: later.toISOString(), status: 'open' as const };
	assert.ok(!isOpenToOffers({ deal: null, offers: [offer, { ...offer, id: 'p' }] }, now), 'two open offers is the most on the table');
	assert.equal(drawOffer('lake', 20, seededRandom(1), now), null, 'a poor water draws no offer');
	const drawn = offersOverDays('lake', 70, 400, { deal: null, offers: [] }, seededRandom(7), now);
	const end = new Date(now.getTime() + 400 * 60 * 60 * 1000);
	const stillOpen = drawn.filter((one) => isOfferOpen({ status: 'open', expiresAt: one.expiresAt }, end));
	assert.ok(drawn.length >= 3 && stillOpen.length <= 2, 'over a long absence offers come and lapse, and never more than two are open at once');
	assert.ok(drawn.every((one) => one.amount >= perTermFor(70) * BrandMoneyFactor.starter), 'every offer is worth at least one term at the brand\'s rate');
	console.log('sponsorship:', { perTermAt70: perTermFor(70), drawn: drawn.length });
}
