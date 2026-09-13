<script lang="ts">
	import type { RecordHeld } from '$lib/contracts/TrophyRoom';
	import { RecordScopeWords } from '$lib/domain/trophies/recordScopes';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';

	let { records, isMine = false }: { records: RecordHeld[]; isMine?: boolean } = $props();
</script>

<section class="panel">
	<h2 class="mb-1 text-xl text-volt-300">Records held today</h2>
	<p class="mb-3 text-xs text-mist-400">The records that stand right now with {isMine ? 'your' : 'this angler’s'} name on them. Any angler can take one.</p>
	{#if records.length === 0}
		<p class="text-sm text-mist-400">{isMine ? 'None yet. Beat the biggest fish an angler has had on a water and it goes here.' : 'None standing.'}</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60">
			{#each records as record (record.scope + record.scopeId)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
					<span class="rounded-full bg-volt-500 px-2 py-0.5 font-display text-xs font-bold tracking-wide text-carbon-950 uppercase">{RecordScopeWords[record.scope]}</span>
					<span class="text-mist-100">{record.scopeName}</span>
					<span class="font-semibold text-volt-300">{formatWeight(record.weightLb)}</span>
					{#if record.carpId}<a href="/carp/{record.carpId}" class="text-mist-400 hover:underline">{record.fishName}</a>{:else}<span class="text-mist-400">{record.fishName}</span>{/if}
					<span class="ml-auto text-xs text-mist-400">{formatWhen(record.caughtAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
