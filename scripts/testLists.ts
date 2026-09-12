import assert from 'node:assert/strict';
import { anglerFiltersFrom, anglerParamsOf } from '../src/lib/domain/lists/anglerFilters';
import { inboxFiltersFrom, inboxParamsOf } from '../src/lib/domain/lists/inboxFilters';
import { actionPathFor, listPathFor } from '../src/lib/domain/lists/listPath';
import { clampedPage, hasMorePages, listPageOf, pageCountOf, pageNumberFrom, Paging, rangeOf } from '../src/lib/domain/lists/paging';
import { waterFiltersFrom, waterParamsOf } from '../src/lib/domain/lists/waterFilters';
import { feedGroupFrom, isActivityInGroup, kindsInGroup, oldestOf, olderFeedPathFor } from '../src/lib/domain/world/feedGroups';
import type { WorldActivity } from '../src/lib/contracts/WorldActivity';

export function runListScenarios() {
	assert.equal(pageNumberFrom(null), Paging.FirstPage, 'no page asked for means the first');
	assert.equal(pageNumberFrom('0'), Paging.FirstPage, 'page zero is the first');
	assert.equal(pageNumberFrom('2.5'), Paging.FirstPage, 'half a page is the first');
	assert.equal(pageNumberFrom('3'), 3);
	assert.deepEqual(rangeOf({ number: 1, size: 12 }), { from: 0, to: 11 }, 'the first page starts at the top');
	assert.deepEqual(rangeOf({ number: 3, size: 12 }), { from: 24, to: 35 });
	assert.equal(pageCountOf(0, 12), 1, 'an empty list is one page');
	assert.equal(pageCountOf(25, 12), 3);
	assert.equal(clampedPage({ number: 9, size: 12 }, 25).number, 3, 'asking past the end lands on the last page');
	const page = listPageOf(['a', 'b'], 26, { number: 3, size: 12 });
	assert.deepEqual(page, { items: ['a', 'b'], total: 26, number: 3, count: 3 });
	assert.ok(hasMorePages(page));
	assert.ok(!hasMorePages(listPageOf([], 0, { number: 1, size: 12 })));

	assert.equal(listPathFor('/lakes', { region: null, sort: null, search: '' }), '/lakes', 'defaults leave the path bare');
	assert.equal(listPathFor('/lakes', { region: 'uk_ireland', search: 'mere' }, 2), '/lakes?region=uk_ireland&search=mere&page=2');
	assert.equal(actionPathFor('markRead', {}), '?/markRead');
	assert.equal(actionPathFor('markRead', { show: 'unread' }, 2), '?/markRead&show=unread&page=2', 'the filters ride along with the action');

	const waters = waterFiltersFrom(new URLSearchParams('region=uk_ireland&sort=biggest&search=%20Willow%20&page=2'));
	assert.deepEqual(waters, { region: 'uk_ireland', sort: 'biggest', search: 'Willow', page: 2 });
	assert.deepEqual(waterFiltersFrom(new URLSearchParams('region=mars&sort=oddest')), { region: null, sort: 'reputation', search: '', page: 1 }, 'nonsense falls back to defaults');
	assert.deepEqual(waterParamsOf(waters), { region: 'uk_ireland', sort: 'biggest', search: 'Willow' });
	assert.equal(waterFiltersFrom(new URLSearchParams(`search=${'x'.repeat(80)}`)).search.length, 40, 'a search is cut to length');

	assert.deepEqual(inboxFiltersFrom(new URLSearchParams('show=unread&page=4')), { isUnreadOnly: true, page: 4 });
	assert.deepEqual(inboxParamsOf({ isUnreadOnly: false, page: 1 }), { show: null });
	assert.deepEqual(anglerFiltersFrom(new URLSearchParams('sort=landed&region=france')), { region: 'france', sort: 'landed', search: '', page: 1 });
	assert.deepEqual(anglerParamsOf({ region: null, sort: 'skill', search: 'ne', page: 3 }), { region: null, sort: null, search: 'ne' });

	assert.equal(feedGroupFrom('matches'), 'matches');
	assert.equal(feedGroupFrom('gossip'), null, 'an unknown group is everything');
	assert.deepEqual(kindsInGroup('catches'), ['big_catch', 'record']);
	assert.equal(kindsInGroup(null), null);
	const activity = (kind: WorldActivity['kind'], createdAt: string): WorldActivity => ({ id: createdAt, kind, lakeId: 'l', lakeName: 'L', otherLakeId: null, otherLakeName: null, region: null, payload: {}, createdAt });
	const feed = [activity('sale', '2026-03-02T00:00:00Z'), activity('big_catch', '2026-03-01T00:00:00Z'), activity('handover', '2026-03-03T00:00:00Z')];
	assert.ok(isActivityInGroup(feed[0], 'market') && !isActivityInGroup(feed[0], 'catches') && isActivityInGroup(feed[0], null));
	assert.equal(oldestOf(feed)?.createdAt, '2026-03-01T00:00:00Z', 'the oldest line is where older ones are fetched from');
	assert.equal(oldestOf([]), null);
	assert.equal(olderFeedPathFor('2026-03-01T00:00:00Z', 'lines'), '/world/feed?before=2026-03-01T00%3A00%3A00Z&group=lines');
	assert.equal(olderFeedPathFor('2026-03-01T00:00:00Z', null), '/world/feed?before=2026-03-01T00%3A00%3A00Z');
	console.log('lists:', { pages: page.count, feedGroups: kindsInGroup('waters') });
}
