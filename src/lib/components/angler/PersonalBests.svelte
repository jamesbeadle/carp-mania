<script lang="ts">
	import type { Catch } from '$lib/domain/types';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';

	interface Props {
		catches: Catch[];
		carpNames: Record<string, string>;
		lakeNames: Record<string, string>;
	}

	let { catches, carpNames, lakeNames }: Props = $props();

	const UnnamedCarp = 'Unnamed carp';
	const WaterSinceClosed = 'a water since closed';
</script>

{#if catches.length === 0}
	<p class="text-sm text-mist-400">Nothing on the mat yet.</p>
{:else}
	<ol class="divide-y divide-carbon-700/60">
		{#each catches as caught, index (caught.id)}
			<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
				<span class="stat-label w-6">{index + 1}</span>
				<span class="font-semibold text-volt-300">{formatWeight(caught.weight_lb)}</span>
				{#if caught.carp_id && carpNames[caught.carp_id]}
					<a href="/carp/{caught.carp_id}" class="text-mist-100 hover:underline">{carpNames[caught.carp_id]}</a>
				{:else}
					<span class="text-mist-100">{UnnamedCarp}</span>
				{/if}
				<span class="text-mist-400">from <a href="/lakes/{caught.lake_id}" class="hover:underline">{lakeNames[caught.lake_id] ?? WaterSinceClosed}</a></span>
				<span class="ml-auto text-xs text-mist-400">{formatWhen(caught.caught_at)}</span>
			</li>
		{/each}
	</ol>
{/if}
