<script lang="ts">
	import { invalidate } from '$app/navigation';
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import Dossier from '$lib/components/carp/Dossier.svelte';
	import BidBox from '$lib/components/market/BidBox.svelte';
	import BidHistory from '$lib/components/market/BidHistory.svelte';
	import { TickingClock } from '$lib/components/market/tickingClock.svelte';
	import { ListingRefresh } from './listingRefresh';

	let { data, form } = $props();

	const clock = new TickingClock();
	const now = $derived(clock.nowOr(data.loadedAt));
	const isOpen = $derived(data.listingPage.listing.status === 'open');

	$effect(() => clock.start());
	$effect(() => {
		if (!isOpen) return;
		const refresh = setInterval(() => invalidate(ListingRefresh.Dependency), ListingRefresh.EveryMilliseconds);
		return () => clearInterval(refresh);
	});
</script>

<ActionMessage {form} />

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<Dossier dossier={data.listingPage.dossier} hasListingLink={false} />
	<div class="flex flex-col gap-6">
		<BidBox page={data.listingPage} {now} />
		<BidHistory bids={data.listingPage.bids} />
	</div>
</div>
