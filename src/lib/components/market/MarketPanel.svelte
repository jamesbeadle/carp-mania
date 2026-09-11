<script lang="ts">
	import { page } from '$app/state';
	import type { MyMarketActivity } from '$lib/contracts/MyMarketActivity';
	import type { Carp } from '$lib/domain/types';
	import ListingForm from './ListingForm.svelte';
	import MyBidsPanel from './MyBidsPanel.svelte';
	import MyListingsPanel from './MyListingsPanel.svelte';
	import SalesLedger from './SalesLedger.svelte';
	import { TickingClock } from './tickingClock.svelte';

	let { activity, carp, loadedAt }: { activity: MyMarketActivity; carp: Carp[]; loadedAt: string } = $props();

	const ChosenFishParameter = 'list';

	const clock = new TickingClock();
	const now = $derived(clock.nowOr(loadedAt));
	$effect(() => clock.start());

	const listedCarpIds = $derived(activity.openListings.map((mine) => mine.fish.id));
	const chosenCarpId = $derived(page.url.searchParams.get(ChosenFishParameter));
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<MyListingsPanel openListings={activity.openListings} closedListings={activity.closedListings} {now} />
	<MyBidsPanel leadingBids={activity.leadingBids} outbidBids={activity.outbidBids} {now} />
</div>
<div class="mt-6">
	<ListingForm {carp} {listedCarpIds} {chosenCarpId} />
</div>
<div class="mt-6">
	<SalesLedger sales={activity.sales} purchases={activity.purchases} lakeNames={activity.lakeNames} />
</div>
