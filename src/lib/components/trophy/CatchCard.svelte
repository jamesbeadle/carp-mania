<script lang="ts">
	import type { CatchCard } from '$lib/contracts/TrophyRoom';
	import { RecordScopeWords } from '$lib/domain/trophies/recordScopes';
	import { RibbonWords } from '$lib/domain/trophies/ribbons';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';

	let { card, place }: { card: CatchCard; place: number } = $props();

	const isARecordStill = $derived(card.stillHolds.length > 0);
</script>

<article class={['panel relative flex flex-col gap-2 overflow-hidden', isARecordStill && 'border-volt-500/50 shadow-volt']}>
	<span class="absolute top-3 right-4 font-display text-5xl font-extrabold text-carbon-600/70 italic tabular-nums" aria-hidden="true">{place}</span>
	<p class="font-display text-4xl leading-none font-extrabold text-volt-300 italic tabular-nums">{formatWeight(card.weightLb)}</p>
	<p class="text-lg leading-tight text-mist-100">
		{#if card.carpId}<a href="/carp/{card.carpId}" class="hover:underline">{card.fishName}</a>{:else}{card.fishName}{/if}
		{#if !card.isStillSwimming}<span class="ml-1 text-xs text-mist-400">in the book</span>{/if}
	</p>
	<p class="text-sm text-mist-400">
		<a href="/lakes/{card.lakeId}" class="text-surge-400 hover:underline">{card.lakeName}</a> · {card.swimName} · {formatWhen(card.caughtAt)}
	</p>
	{#if card.honoursOnTheDay.length > 0 || isARecordStill}
		<ul class="mt-auto flex flex-wrap gap-1.5 pt-1">
			{#each card.stillHolds as scope (scope)}
				<li class="rounded-full bg-volt-500 px-2 py-0.5 font-display text-xs font-bold tracking-wide text-carbon-950 uppercase">Holds the {RecordScopeWords[scope].toLowerCase()}</li>
			{/each}
			{#each card.honoursOnTheDay as honour (honour)}
				<li class="rounded-full border border-volt-500/50 px-2 py-0.5 font-display text-xs font-bold tracking-wide text-volt-300 uppercase">{RibbonWords[honour]} on the day</li>
			{/each}
		</ul>
	{/if}
</article>
