import assert from 'node:assert/strict';
import { bidSummaryFor, currentBidOf, summariseBids } from '../src/lib/domain/market/bidSummary';
import { whyListingCannotBeCancelled, whyListingRefusesBid, whyListingRefusesBuyNow } from '../src/lib/domain/market/listingGates';
import { marketIndexFrom } from '../src/lib/domain/market/marketIndex';
import { splitMyBids } from '../src/lib/domain/market/myBids';
import { marketPathFor, readMarketFilters } from '../src/lib/domain/market/readMarketFilters';
import { reserveState } from '../src/lib/domain/market/reserveState';
import { hasEnded, timeLeft } from '../src/lib/format/timeLeft';

const now = new Date('2026-06-01T12:00:00Z');
const minutesLater = (minutes: number) => new Date(now.getTime() + minutes * 60 * 1000);
const MinutesPerDay = 24 * 60;

function timeLeftScenario() {
	assert.equal(timeLeft(minutesLater(134), now), '2h 14m');
	assert.equal(timeLeft(minutesLater(28 * 60), now), '1d 4h');
	assert.equal(timeLeft(minutesLater(41), now), '41 min');
	assert.equal(timeLeft(minutesLater(0.5), now), 'ending');
	assert.equal(timeLeft(minutesLater(-5), now), 'ending');
	assert.equal(timeLeft(minutesLater(3 * MinutesPerDay).toISOString(), now), '3d 0h');
	assert.ok(hasEnded(now, now));
	assert.ok(!hasEnded(minutesLater(1), now));
}

function reserveScenario() {
	assert.equal(reserveState(null, null), 'none');
	assert.equal(reserveState(null, 500), 'none');
	assert.equal(reserveState(1000, null), 'not_met');
	assert.equal(reserveState(1000, 990), 'not_met');
	assert.equal(reserveState(1000, 1000), 'met');
}

function filtersScenario() {
	const filters = readMarketFilters(new URLSearchParams('band=20s&strain=mirror&price=5000&region=france&kind=auction&sort=heaviest&page=3&lake=abc'));
	assert.deepEqual(filters, { band: '20s', strain: 'mirror', maxPrice: 5000, region: 'france', lake: 'abc', kind: 'auction', sort: 'heaviest', page: 3 });
	assert.equal(marketPathFor(filters, 4), '/market?band=20s&strain=mirror&price=5000&region=france&lake=abc&kind=auction&sort=heaviest&page=4');
	const defaults = readMarketFilters(new URLSearchParams('band=60s&strain=koi&price=-3&region=mars&kind=swap&sort=random&page=0'));
	assert.deepEqual(defaults, { band: null, strain: null, maxPrice: null, region: null, lake: null, kind: 'all', sort: 'ending_soon', page: 1 });
	assert.equal(marketPathFor(defaults), '/market');
}

function bidSummaryScenario() {
	const summaries = summariseBids([
		{ listing_id: 'a', amount: 100, status: 'outbid' },
		{ listing_id: 'a', amount: 120, status: 'leading' },
		{ listing_id: 'b', amount: 500, status: 'won' }
	]);
	assert.deepEqual(bidSummaryFor(summaries, 'a'), { leadingBid: 120, bidCount: 2 });
	assert.deepEqual(bidSummaryFor(summaries, 'b'), { leadingBid: 500, bidCount: 1 });
	assert.deepEqual(bidSummaryFor(summaries, 'c'), { leadingBid: null, bidCount: 0 });
	assert.equal(currentBidOf(1000, null), 1000);
	assert.equal(currentBidOf(1000, 1200), 1200);
}

function myBidsScenario() {
	const { leading, outbid } = splitMyBids([
		{ id: '1', listing_id: 'x', status: 'outbid' as const },
		{ id: '2', listing_id: 'x', status: 'outbid' as const },
		{ id: '3', listing_id: 'y', status: 'leading' as const },
		{ id: '4', listing_id: 'y', status: 'outbid' as const }
	]);
	assert.deepEqual(leading.map((bid) => bid.id), ['3'], 'the bid I am leading with');
	assert.deepEqual(outbid.map((bid) => bid.id), ['1'], 'one outbid entry per listing, the latest, and none where I lead');
}

function listingGatesScenario() {
	const listing = { status: 'open', kind: 'auction', ends_at: minutesLater(60).toISOString(), seller_id: 'seller', buy_now_price: null } as const;
	assert.equal(whyListingRefusesBid(listing, 'buyer', now), null);
	assert.equal(whyListingRefusesBid(listing, 'seller', now), 'You cannot bid on your own fish');
	assert.equal(whyListingRefusesBid({ ...listing, status: 'sold' }, 'buyer', now), 'That auction has closed');
	assert.equal(whyListingRefusesBid({ ...listing, kind: 'buy_now' }, 'buyer', now), 'That fish is buy-now only');
	assert.equal(whyListingRefusesBid({ ...listing, ends_at: now.toISOString() }, 'buyer', now), 'That auction has ended');
	assert.equal(whyListingRefusesBuyNow(listing, 'buyer', now), 'That fish has no buy-now price; bid for it instead');
	assert.equal(whyListingRefusesBuyNow({ ...listing, buy_now_price: 900 }, 'buyer', now), null);
	assert.equal(whyListingCannotBeCancelled(listing, 'seller', 0), null);
	assert.equal(whyListingCannotBeCancelled(listing, 'seller', 1), 'You cannot cancel once someone has bid');
	assert.equal(whyListingCannotBeCancelled(listing, 'buyer', 0), 'That listing is not yours');
}

function marketIndexScenario() {
	const twoTwentiesAndAThirty = [{ weightLb: 25, price: 2500 }, { weightLb: 22, price: 3140 }, { weightLb: 35, price: 10150 }];
	assert.deepEqual(marketIndexFrom(twoTwentiesAndAThirty), [{ label: '20s', poundsPerLb: 120, sales: 2 }, { label: '30s', poundsPerLb: 290, sales: 1 }]);
	assert.deepEqual(marketIndexFrom([]), []);
}

export function runListingScenarios() {
	timeLeftScenario();
	reserveScenario();
	filtersScenario();
	bidSummaryScenario();
	myBidsScenario();
	listingGatesScenario();
	marketIndexScenario();
}
