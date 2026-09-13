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

<svelte:head><title>{data.listingPage.dossier.carp.name} for sale · Carp Mania</title></svelte:head>

<p class="mb-4"><a href="/market" class="text-sm text-surge-400 hover:underline">← Back to the tackle shop</a></p>
<ActionMessage {form} />

<Dossier dossier={data.listingPage.dossier} hasListingLink={false}>
	{#snippet aside()}
		<BidBox page={data.listingPage} {now} />
		<BidHistory bids={data.listingPage.bids} />
	{/snippet}
</Dossier>
