<script lang="ts">
	import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
	import type { Profile } from '$lib/domain/types';
	import { fishInTheWater, isStockedToOpen } from '$lib/domain/stock/stockedToOpen';
	import type { LakeForAnglers } from '$lib/server/queries/GetLake';
	import ClosedForRestocking from '../lake/ClosedForRestocking.svelte';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import TicketOfficeStats from './TicketOfficeStats.svelte';
	import TicketPicker from './TicketPicker.svelte';

	interface Props {
		water: LakeForAnglers;
		profile: Profile;
		book: TicketProduct[];
		knownCarpCount: number;
		streakIfFishedToday: number;
	}

	let { water, profile, book, knownCarpCount, streakIfFishedToday }: Props = $props();

	const isOwnWater = $derived(water.lake.owner_id === profile.id);
	const fishCount = $derived(fishInTheWater(water.carp, water.shoals));
	const isClosedForRestocking = $derived(!isStockedToOpen(fishCount));
	const FreeWords = 'Walk to the lake';
	const noTicketWords = $derived(isOwnWater ? 'Your own water — no ticket needed. Pick the hours you want to sit.' : null);
</script>

<p class="stat-label">{water.ownerName}'s water</p>
<h1 class="mb-6 text-4xl text-volt-300">{water.lake.name}</h1>
<section class="panel max-w-xl">
	<h2 class="mb-4 text-2xl text-volt-300">The ticket office</h2>
	<TicketOfficeStats lake={water.lake} carp={water.carp} {knownCarpCount} money={Number(profile.money)} {streakIfFishedToday} />
	{#if noTicketWords}<p class="mt-3 text-sm text-volt-300">{noTicketWords}</p>{/if}
	{#if water.lake.is_barbed_banned}<p class="mt-3 text-sm text-warning-500">Barbless only on this water.</p>{/if}
	<div class="mt-2 border-t border-carbon-700/60">
		{#if isClosedForRestocking}
			<div class="mt-3"><ClosedForRestocking {fishCount} isOwner={isOwnWater} /></div>
		{:else}
			<TicketPicker {book} money={Number(profile.money)} isFree={isOwnWater} freeWords={FreeWords} />
		{/if}
	</div>
	<div class="mt-2">
		<AboutToggle title="About the hours">First light and the evening into the dark are when the big fish feed. A day ticket runs seven till seven; a night ticket goes into the dark and out the other side; a 24-hour ticket has both magic windows in it.</AboutToggle>
	</div>
</section>
