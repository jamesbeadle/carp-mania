<script lang="ts">
	import { fishOutBetween, type VisitOnTheBank } from '$lib/domain/fishing/onTheBank';
	import { timeSince } from '$lib/format/timeSince';
	import StatRow from '../stats/StatRow.svelte';

	let { anglers, now, myId }: { anglers: VisitOnTheBank[]; now: Date; myId: string | null } = $props();

	const NoFish = 0;
	const OneFish = 1;
	const fishOut = $derived(fishOutBetween(anglers));
	const stats = $derived([
		{ label: 'On the bank', value: String(anglers.length), caption: 'now', tone: anglers.length > 0 ? ('volt' as const) : ('mist' as const) },
		{ label: 'Fish out', value: String(fishOut), caption: 'between them' }
	]);

	function fishWords(count: number) {
		if (count === NoFish) return 'nothing yet';
		return count === OneFish ? '1 fish' : `${count} fish`;
	}
</script>

<section class="rounded-lg border border-carbon-700 bg-carbon-900/60 p-3">
	<h3 class="mb-2 font-display text-base font-bold tracking-wide text-mist-100 uppercase">Who is fishing now</h3>
	<StatRow {stats} />
	{#if anglers.length === 0}
		<p class="mt-2 text-xs text-mist-400">Nobody is on the bank right now — the water would be yours.</p>
	{:else}
		<ul class="mt-3 divide-y divide-carbon-700/60">
			{#each anglers as angler (angler.anglerId)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-1.5 text-sm">
					<a href="/anglers/{angler.anglerId}" class="text-mist-100 hover:underline">{angler.anglerName}</a>
					{#if angler.anglerId === myId}<span class="text-xs text-volt-300">you</span>{/if}
					<span class="text-xs text-mist-400">arrived {timeSince(angler.arrivedAt, now)}</span>
					<span class="ml-auto text-xs {angler.fishCaught > NoFish ? 'text-volt-300' : 'text-mist-400'}">{fishWords(angler.fishCaught)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
