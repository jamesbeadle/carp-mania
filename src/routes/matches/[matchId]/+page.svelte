<script lang="ts">
	import { invalidate } from '$app/navigation';
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import { TickingClock } from '$lib/components/market/tickingClock.svelte';
	import MatchBoard from '$lib/components/matches/MatchBoard.svelte';
	import MatchPot from '$lib/components/matches/MatchPot.svelte';
	import MatchResult from '$lib/components/matches/MatchResult.svelte';
	import PhaseBadge from '$lib/components/matches/PhaseBadge.svelte';
	import { timelineOf } from '$lib/game/matches/matchWords';
	import { BoardRefresh } from './boardRefresh';

	let { data, form } = $props();

	const clock = new TickingClock();
	const now = $derived(clock.nowOr(data.page.loadedAt));
	const card = $derived(data.page.card);
	const isLive = $derived(card.phase === 'in_play' || card.phase === 'ended');

	$effect(() => clock.start());
	$effect(() => {
		if (!isLive) return;
		const refresh = setInterval(() => invalidate(BoardRefresh.Dependency), BoardRefresh.EveryMilliseconds);
		return () => clearInterval(refresh);
	});
</script>

<svelte:head><title>{card.match.title} · Carp Mania</title></svelte:head>

<ActionMessage {form} />

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<p class="stat-label"><a href="/lakes/{card.match.lake_id}" class="hover:underline">{card.lakeName}</a> · {card.ownerName}'s water · hosted by {card.hostName}</p>
		<h1 class="text-4xl text-volt-300">{card.match.title}</h1>
		<p class="text-sm text-mist-400">{timelineOf(card.match, card.phase, now)}</p>
	</div>
	<div class="ml-auto flex items-center gap-3">
		<PhaseBadge phase={card.phase} />
		<a href="/matches" class="text-sm text-surge-400 hover:underline">← All matches</a>
	</div>
</div>

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<div class="space-y-6">
		{#if data.page.trophies.length > 0}<MatchResult trophies={data.page.trophies} />{/if}
		<MatchBoard page={data.page} isLive={card.phase === 'in_play'} />
	</div>
	<MatchPot page={data.page} />
</div>
