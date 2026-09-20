<script lang="ts">
	import type { AnglerStanding, HallOfFameCatch, VisitorsBest } from '$lib/contracts/HallOfFame';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';
	import { lastOnTheBoard, standingWords } from '$lib/domain/world/standingWords';
	import YouPill from './YouPill.svelte';

	interface Props {
		catches: HallOfFameCatch[];
		viewerId: string;
		standing: AnglerStanding;
		visitorsBest: VisitorsBest | null;
		boardLength: number;
	}

	let { catches, viewerId, standing, visitorsBest, boardLength }: Props = $props();

	const words = $derived(standingWords(standing, lastOnTheBoard(catches, boardLength)));
</script>

<section class="panel">
	<h2 class="text-2xl text-volt-300">Biggest fish caught by an angler</h2>
	<p class="mb-3 text-xs text-mist-400">Anglers only · the owner of the water credited alongside.</p>
	{#if catches.length === 0}
		<p class="text-sm text-mist-400">Nothing on the board yet — the first great fish is still out there.</p>
	{:else}
		<ol class="divide-y divide-carbon-700/60">
			{#each catches as caught, index (caught.catchId)}
				{@const isViewers = caught.anglerId === viewerId}
				<li class={['flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm', isViewers && '-mx-2 rounded-md bg-volt-500/10 px-2']}>
					<span class="w-6 font-display text-2xl font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
					<span class="font-display text-xl font-bold text-volt-300 tabular-nums">{formatWeight(caught.weightLb)}</span>
					{#if caught.carpId}<a href="/carp/{caught.carpId}" class="text-mist-100 hover:underline">{caught.fishName}</a>{:else}<span class="text-mist-100">{caught.fishName}</span>{/if}
					<span class="text-mist-400">by</span>
					{#if caught.anglerId}<a href="/anglers/{caught.anglerId}" class="text-mist-100 hover:underline">{caught.anglerName}</a>{:else}<span class="text-mist-100">{caught.anglerName}</span>{/if}
					{#if isViewers}<YouPill />{/if}
					<span class="text-mist-400">at</span>
					<a href="/lakes/{caught.lakeId}" class="text-surge-400 hover:underline">{caught.lakeName}</a>
					{#if caught.ownerName}<span class="text-mist-400">({caught.ownerName}'s water)</span>{/if}
					<span class="ml-auto text-xs whitespace-nowrap text-mist-400">{formatWhen(caught.caughtAt)} · {caught.isStillSwimming ? 'still swims' : 'in the book'}</span>
				</li>
			{/each}
		</ol>
	{/if}
	<p class="mt-3 text-sm text-volt-300">{words}</p>
	{#if visitorsBest}
		<p class="mt-2 text-xs text-mist-400/80">
			Visitors' best: {formatWeight(visitorsBest.weightLb)}
			{#if visitorsBest.carpId}<a href="/carp/{visitorsBest.carpId}" class="hover:underline">at {visitorsBest.lakeName}</a>{:else}at {visitorsBest.lakeName}{/if}
			by {visitorsBest.anglerName}, {formatWhen(visitorsBest.caughtAt)} — a visitor never holds a record.
		</p>
	{/if}
</section>
