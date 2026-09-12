<script lang="ts">
	import MatchCard from '$lib/components/matches/MatchCard.svelte';
	import MatchRow from '$lib/components/matches/MatchRow.svelte';
	import { TickingClock } from '$lib/components/market/tickingClock.svelte';

	let { data } = $props();

	const clock = new TickingClock();
	const now = $derived(clock.nowOr(data.noticeboard.loadedAt));
	const board = $derived(data.noticeboard);
	const hasNothingOn = $derived(board.inPlay.length === 0 && board.comingUp.length === 0);

	$effect(() => clock.start());
</script>

<svelte:head><title>Matches · Carp Mania</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">Matches</h1>
		<p class="text-mist-400">Book a water, put up a pot, and fish it out: most fish takes one prize, the biggest fish the other.</p>
	</div>
	<div class="ml-auto flex flex-wrap gap-3">
		{#if board.myWaterId}<a href="/lakes/{board.myWaterId}/host-a-match" class="button-primary">Host one on my water</a>{/if}
		<a href="/lakes" class="button-secondary">Host on another water</a>
	</div>
</div>

{#if hasNothingOn}
	<section class="panel mb-6">
		<p class="text-mist-200">Nothing is booked. Pick a water, book it out and the pot is yours to set.</p>
	</section>
{/if}

{#if board.inPlay.length > 0}
	<h2 class="stat-label mb-3">In play</h2>
	<div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each board.inPlay as card (card.match.id)}<MatchCard {card} {now} />{/each}
	</div>
{/if}

{#if board.comingUp.length > 0}
	<h2 class="stat-label mb-3">Coming up</h2>
	<div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each board.comingUp as card (card.match.id)}<MatchCard {card} {now} />{/each}
	</div>
{/if}

{#if board.recentlySettled.length > 0}
	<section class="panel">
		<h2 class="mb-3 text-2xl text-volt-300">Recent results</h2>
		<ol class="divide-y divide-carbon-700/60">
			{#each board.recentlySettled as card (card.match.id)}<MatchRow {card} {now} />{/each}
		</ol>
	</section>
{/if}
