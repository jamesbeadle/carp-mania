<script lang="ts">
	import { DeathCauseWords, type CarpMemorial } from '$lib/domain/memorialTypes';
	import { formatWhen } from '$lib/format/dates';
	import { humanise } from '$lib/format/labels';
	import { formatWeight } from '$lib/format/weight';

	let { legends }: { legends: CarpMemorial[] } = $props();
</script>

<section class="panel">
	<h2 class="text-2xl text-volt-300">Legends</h2>
	<p class="mb-3 text-xs text-mist-400">Fish that have died. Nobody will catch them again.</p>
	{#if legends.length === 0}
		<p class="text-sm text-mist-400">Every fish in the world is still swimming.</p>
	{:else}
		<ol class="divide-y divide-carbon-700/60">
			{#each legends as fish, index (fish.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
					<span class="w-6 font-display text-2xl font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
					<a href="/carp/{fish.id}" class="font-display text-lg font-bold text-mist-100 hover:underline">{fish.name}</a>
					<span class="text-mist-400">{humanise(fish.strain)} · {formatWeight(fish.weight_lb)} · aged {fish.age_years} · fame {fish.fame} · caught {fish.times_caught} times</span>
					<span class="ml-auto text-xs whitespace-nowrap text-mist-400">{fish.lake_name} · {DeathCauseWords[fish.death_cause]} · {formatWhen(fish.died_at)}</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
