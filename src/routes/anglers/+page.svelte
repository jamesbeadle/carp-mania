<script lang="ts">
	import AnglerCard from '$lib/components/angler/AnglerCard.svelte';
	import AnglerFilterBar from '$lib/components/angler/AnglerFilterBar.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import { anglerParamsOf, AnglerListing } from '$lib/domain/lists/anglerFilters';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { Paging } from '$lib/domain/lists/paging';

	let { data } = $props();

	const AnglersPath = '/anglers';
	const directory = $derived(data.directory);
	const firstRank = $derived((directory.page.number - Paging.FirstPage) * AnglerListing.PageSize + 1);
	const hrefFor = (page: number) => listPathFor(AnglersPath, anglerParamsOf(directory.filters), page);
</script>

<svelte:head><title>Anglers · Carp Mania</title></svelte:head>

<h1 class="mb-2 text-4xl text-volt-300">Anglers</h1>
<p class="mb-6 text-mist-400">Every rod in the game. Open an angler for their personal bests, their famous fish and their water.</p>

<AnglerFilterBar filters={directory.filters} />

{#if directory.page.items.length === 0}
	<p class="text-sm text-mist-400">{directory.filters.search || directory.filters.region ? 'No angler matches that.' : 'Nobody has signed in yet.'}</p>
{:else}
	<ol class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each directory.page.items as angler, index (angler.id)}
			<li><AnglerCard {angler} rank={firstRank + index} /></li>
		{/each}
	</ol>
{/if}

<Pager page={directory.page} noun="angler" {hrefFor} />
