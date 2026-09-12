<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import HostMatchForm from '$lib/components/matches/HostMatchForm.svelte';
	import { MatchTerms } from '$lib/domain/matches/matchRules';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const lake = $derived(data.water.lake);
	const isOwnWater = $derived(lake.owner_id === data.profile.id);
	const hasRoomToHost = $derived(data.openMatchesHosted < MatchTerms.MostOpenMatchesPerHost);
</script>

<svelte:head><title>Host a match at {lake.name} · Carp Mania</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<p class="stat-label">{data.water.ownerName}'s water · day tickets {formatMoney(lake.day_ticket_fee)}</p>
		<h1 class="text-4xl text-volt-300">Host a match at {lake.name}</h1>
		<p class="text-sm text-mist-400">{data.water.swims.length} pegs · most catches takes one prize, the biggest fish the other · ties share</p>
	</div>
	<a href="/lakes/{lake.id}" class="ml-auto text-sm text-surge-400 hover:underline">← {lake.name}</a>
</div>

<ActionMessage {form} />

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	{#if !lake.is_public}
		<section class="panel"><p class="text-mist-200">{isOwnWater ? 'Open the gates before hosting a match on your own water.' : 'This water is not open to anglers.'}</p></section>
	{:else if !hasRoomToHost}
		<section class="panel"><p class="text-mist-200">You already have {MatchTerms.MostOpenMatchesPerHost} matches on the go. Wait for one to finish before booking another.</p></section>
	{:else}
		<HostMatchForm {lake} pegs={data.water.swims.length} money={Number(data.profile.money)} {isOwnWater} />
	{/if}
	<section class="panel self-start text-sm text-mist-200">
		<h2 class="mb-2 text-xl text-volt-300">How a match works</h2>
		<p class="mb-2">You book the water for a window. While it runs nobody but your entrants can buy a day ticket, and entrants fish for free. Every catch they record on the water inside the window goes on the board.</p>
		<p class="mb-2">Entry fees and your stake make the pot. When the window closes the pot is paid out the way you split it, ties share, and the winners get a trophy in their scrapbook and a line in the hall of fame.</p>
		<p>If nobody catches a thing every fee comes back. Call it off before it starts and the entries come back too; the booking fee is spent either way.</p>
	</section>
</div>
