import assert from 'node:assert/strict';
import { DealerTerms, dealerOffersFor } from '../src/lib/domain/market/dealer';
import { farmFishFor } from '../src/lib/domain/market/farmDelivery';
import { packPriceFor, packsFor, SizeBands, type FarmPack } from '../src/lib/domain/market/farmPacks';
import { farmQuoteFor } from '../src/lib/domain/market/farmQuote';
import { FarmCatalogue, farmById, GradeCatalogue } from '../src/lib/domain/market/farms';
import { doesFarmSellTo, farmStandingWords, FarmWantsWaterRating } from '../src/lib/domain/market/farmStanding';
import { waterRatingOfLake } from '../src/lib/domain/water/waterRating';
import { seededRandom } from '../src/lib/domain/random';
import { stockBySize } from '../src/lib/domain/stock/stockBySize';
import { RegionCodes } from '../src/lib/domain/world/regionCodes';

const QuartersPerPound = 4;
const now = new Date('2026-09-19T12:00:00Z');
const ukWater = { latitude: 51.5, longitude: -0.5, region: 'uk_ireland' as const };

function standingScenario() {
	const freshGravelPit = { reputation: 10, transparency: 80, weed: 25, silt: 10 };
	const rating = waterRatingOfLake(freshGravelPit);
	assert.ok(rating < FarmWantsWaterRating.specialist, `a fresh gravel pit is rated ${rating.toFixed(0)}, under a specialist's bar`);
	assert.ok(doesFarmSellTo('stock', 0), 'a stock farm sells to any water');
	assert.ok(!doesFarmSellTo('record', FarmWantsWaterRating.record - 1), 'a record grower will not sell a point under its bar');
	assert.ok(doesFarmSellTo('record', FarmWantsWaterRating.record), 'and sells at it');
	const donau = farmById('donau-karpfenhof')!;
	assert.ok(farmStandingWords(donau, rating).includes('will not take your order yet'), 'the refusal is said in words');
	assert.equal(farmStandingWords(farmById('meadow-fisheries')!, rating), 'Sells to any water', 'a stock farm says so');
	console.log('farm standing:', { freshGravelPit: rating.toFixed(1), bars: FarmWantsWaterRating });
}

function farmsScenario() {
	assert.equal(FarmCatalogue.length, 12, 'twelve farms');
	for (const region of RegionCodes.filter((code) => code !== 'australia_nz')) {
		assert.ok(FarmCatalogue.some((farm) => farm.region === region), `a farm in ${region}`);
	}
	const donau = farmById('donau-karpfenhof')!;
	const quote = farmQuoteFor(donau, ukWater);
	const isAboutAThousand = quote.cost > 900 && quote.cost < 1100;
	assert.ok(isAboutAThousand, `a fifty from the Danube to a UK water quotes about a thousand pounds (${quote.cost})`);
	assert.equal(quote.transitDays, 3, 'three days on the lorry');
	assert.equal(quote.quarantineDays, 5, "five days' quarantine across regions");
	const meadow = farmById('meadow-fisheries')!;
	assert.equal(farmQuoteFor(meadow, ukWater).quarantineDays, 0, 'no quarantine from a farm in the same region');
	assert.equal(farmQuoteFor(meadow, { latitude: null, longitude: null, region: 'uk_ireland' }).quarantineDays, 0, 'an unpinned water is quoted from its region');
}

function packsScenario() {
	const donau = farmById('donau-karpfenhof')!;
	const stockFarm = farmById('meadow-fisheries')!;
	const stockPacks = packsFor(stockFarm, now);
	const stockCeilingLb = GradeCatalogue.stock.sellsUpToLb;
	assert.ok(stockPacks.every((pack) => pack.band.toLb <= stockCeilingLb), 'a stock farm sells nothing over twelve pounds');
	const counts = stockPacks.map((pack) => pack.count);
	assert.ok(counts.every((count) => count >= 20 && count <= 200), 'stock packs are twenty to two hundred');
	assert.deepEqual(packsFor(stockFarm, now), stockPacks, 'the shelf is seeded, so everyone sees the same packs');
	const weekLater = new Date(now.getTime() + 8 * 60 * 60 * 1000);
	assert.notEqual(packsFor(stockFarm, weekLater)[0].id, stockPacks[0].id, 'packs refresh each fishery week');
	const fifties = SizeBands.find((band) => band.key === 'fifties')!;
	const record = GradeCatalogue.record;
	const fiftyPrice = packPriceFor(fifties, record.priceFactor, record.condition.highest);
	assert.ok(fiftyPrice > 40000 && fiftyPrice < 60000 && fiftyPrice % 50 === 0, `a fifty from a record grower is about £46,000 (${fiftyPrice})`);
	const stockies = SizeBands.find((band) => band.key === 'stockies')!;
	assert.ok(packPriceFor(stockies, GradeCatalogue.stock.priceFactor, 85) <= 150, 'a stockie is cheap');
	const someWeeks = Array.from({ length: 30 }, (_, week) => packsFor(donau, new Date(now.getTime() + week * 7 * 60 * 60 * 1000)));
	assert.ok(someWeeks.some((packs) => packs.length === 0), 'some weeks the record grower has nothing');
	const isAFiftyOrTwo = (pack: FarmPack) => pack.band.key === 'fifties' && pack.count <= 2;
	assert.ok(someWeeks.some((packs) => packs.some(isAFiftyOrTwo)), 'other weeks a fifty or two');
}

function deliveryScenario() {
	const pack: FarmPack = { id: 'meadow-fisheries-1-stockies', farmId: 'meadow-fisheries', band: SizeBands[0], count: 50, price: 100, conditionLowest: 75, conditionHighest: 85 };
	const fish = farmFishFor(pack, 20, 'uk_ireland', 100, seededRandom(7));
	assert.equal(fish.length, 20);
	for (const one of fish) {
		const quarters = one.weight_lb * QuartersPerPound;
		assert.ok(one.weight_lb >= 4 && one.weight_lb <= 6, `${one.name} weighs ${one.weight_lb} lb, outside 4–6`);
		assert.equal(quarters, Math.round(quarters), 'weights are quarter pounds');
		assert.ok(one.age_years >= 1 && one.age_years <= 3, 'a pack of 4–6 lb fish arrives aged about two');
		assert.ok(one.condition >= 75 && one.condition <= 85, 'in the grade\'s condition');
	}
	const names = new Set(fish.map((one) => one.name));
	assert.equal(names.size, fish.length, 'names are unique');
	const totalAge = fish.reduce((total, one) => total + one.age_years, 0);
	assert.ok(Math.abs(totalAge / fish.length - 2) < 0.6, 'aged two on average');
}

function dealerAndSizesScenario() {
	const ten = { weight_lb: 10, strain: 'common' as const, condition: 100, fame: 0 };
	const twelve = Array.from({ length: 12 }, () => ten);
	assert.equal(dealerOffersFor(twelve, 0), 3 * 165 + 9 * 135, 'twelve fish: 55% on three, 45% on nine');
	assert.equal(dealerOffersFor(twelve, DealerTerms.FullShareFishPerFisheryDay), 12 * 135, 'after three today, the whole lot at bulk');
	const stock = [4, 9.75, 10, 19.5, 20, 33, 41, 52, 60].map((weight_lb) => ({ weight_lb }));
	const bySize = stockBySize(stock);
	assert.deepEqual(bySize.map((line) => line.count), [2, 2, 1, 1, 1, 2], 'the size breakdown matches the list');
	const counted = bySize.reduce((total, line) => total + line.count, 0);
	assert.equal(counted, stock.length, 'every fish counted once');
	assert.equal(bySize[5].heaviestLb, 60);
}

export function runFarmScenarios() {
	farmsScenario();
	standingScenario();
	packsScenario();
	deliveryScenario();
	dealerAndSizesScenario();
}
