<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import KnownFishList from '$lib/components/legacy/KnownFishList.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import StatRow from '$lib/components/stats/StatRow.svelte';
	import { placeInTheLine } from '$lib/domain/legacy/diary';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';

	let { data } = $props();

	const book = $derived(data.scrapbook);
	const fisherman = $derived(book.fisherman);
	const hrefFor = (page: number) => listPathFor(`/angler/scrapbook/${fisherman.id}`, {}, page);
	const NoFinalSkill = '—';
	const finalSkill = $derived(fisherman.final_skill === null ? NoFinalSkill : String(Math.round(Number(fisherman.final_skill))));
	const lifetimeStats = $derived([
		{ label: 'Landed', value: String(book.catches.total), caption: 'fish' },
		{ label: 'Personal best', value: formatWeight(book.personalBestLb), tone: 'volt' as const },
		{ label: 'Final skill', value: finalSkill }
	]);
	const yearsFished = $derived(fisherman.retired_at ? `${formatWhen(fisherman.started_at)} to ${formatWhen(fisherman.retired_at)}` : `since ${formatWhen(fisherman.started_at)}`);
</script>

<svelte:head><title>{fisherman.name}'s scrapbook · Carp Mania</title></svelte:head>

{#if data.isJustHandedDown}
	<section class="panel mb-6 border-volt-500/40">
		<p class="stat-label">Handed down</p>
		<p class="mt-1 text-mist-100">{fisherman.name} has packed the rods away. This is what he left behind — the water is yours now.</p>
		<a href="/home" class="button-primary mt-4 inline-block">Down to the water</a>
	</section>
{/if}

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<p class="stat-label">Scrapbook · {placeInTheLine(fisherman.generation)}</p>
		<h1 class="text-4xl text-volt-300">{fisherman.name}</h1>
		<p class="text-sm text-mist-400">{fisherman.retired_at ? `Retired at ${book.age}` : `Aged ${book.age}, still fishing`} · fished {yearsFished}</p>
	</div>
	<a href={book.isMine ? '/angler' : '/anglers'} class="ml-auto text-sm text-surge-400 hover:underline">← {book.isMine ? 'My angler' : 'Anglers'}</a>
</div>

<div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
	<div class="space-y-6">
		<section class="panel">
			<StatRow stats={lifetimeStats} />
		</section>
		<KnownFishList fishKnown={book.fishKnown} />
	</div>
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">Every fish on the bank</h2>
		<CatchReportList catches={book.catches.items} carpNames={book.carpNames} lakeNames={book.lakeNames} />
		<Pager page={book.catches} noun="catch" plural="catches" {hrefFor} />
	</section>
</div>
