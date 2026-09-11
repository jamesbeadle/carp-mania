import assert from 'node:assert/strict';
import { nextBidAfter } from '../src/lib/domain/market/bidRules';
import { dealerOfferFor } from '../src/lib/domain/market/dealer';
import { farmOrderTotalCost } from '../src/lib/domain/market/fishFarm';
import { commissionOn, listingFeeFor } from '../src/lib/domain/market/listingRules';
import { transportQuote } from '../src/lib/domain/market/transport';
import { bandPrice, guidePriceOf } from '../src/lib/domain/market/valuation';

export function runMarketScenarios() {
	assert.equal(bandPrice(10), 300);
	assert.equal(bandPrice(20), 1000);
	assert.equal(bandPrice(30), 3000);
	assert.equal(bandPrice(40), 8500);
	assert.equal(bandPrice(50), 22500);
	assert.equal(bandPrice(60), 52500);
	assert.equal(guidePriceOf({ weight_lb: 60, strain: 'ghost', condition: 100, fame: 100 }), 141750, 'the endgame ghost');
	assert.equal(guidePriceOf({ weight_lb: 8, strain: 'common', condition: 100, fame: 0 }), 240);
	assert.equal(dealerOfferFor({ weight_lb: 30, strain: 'common', condition: 100, fame: 0 }), 1650);

	assert.equal(farmOrderTotalCost({ doubles: 60, mid_doubles: 20 }), 32650, 'opening A stock');
	assert.equal(farmOrderTotalCost({ doubles: 80, stockies: 60 }), 33250, 'opening B stock');
	assert.equal(farmOrderTotalCost({ twenties: 10 }), 15250, 'opening C stock');
	assert.equal(farmOrderTotalCost({ doubles: 80, mid_doubles: 30 }), 45850, 'opening D stock');
	assert.equal(farmOrderTotalCost({}), 0);

	assert.equal(listingFeeFor(1000), 25);
	assert.equal(listingFeeFor(8500), 85);
	assert.equal(commissionOn(10000), 800);
	assert.equal(nextBidAfter(7800, 1000), 7960);
	assert.equal(nextBidAfter(null, 1000), 1000);
	assert.equal(nextBidAfter(100, 100), 110);

	const kent = { latitude: 51.2, longitude: 0.7, region: 'uk_ireland' as const };
	const tisza = { latitude: 47.5, longitude: 20.6, region: 'central_europe' as const };
	const quote = transportQuote(kent, tisza);
	assert.ok(quote.distanceKilometres > 1400 && quote.distanceKilometres < 1700, `Kent to the Tisza is about 1,500 km, got ${quote.distanceKilometres}`);
	assert.equal(quote.quarantineDays, 5);
	assert.equal(quote.transitDays, 2);
	assert.equal(transportQuote(kent, kent).quarantineDays, 0);
	assert.equal(transportQuote(kent, kent).cost, 250);
	console.log('market:', { kentToTisza: quote });
}
