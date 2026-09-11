<script lang="ts">
	import type { Catch } from '$lib/domain/types';
	import { formatWhen } from '$lib/format/dates';
	import { humanise } from '$lib/format/labels';
	import { formatWeight } from '$lib/format/weight';

	let { catches, carpNames = {} }: { catches: Catch[]; carpNames?: Record<string, string> } = $props();

	const UnnamedCarp = 'Unnamed carp';
</script>

{#if catches.length === 0}
	<p class="text-sm text-mist-400">No catches reported yet.</p>
{:else}
	<ul class="divide-y divide-carbon-700/60">
		{#each catches as caught (caught.id)}
			<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
				<span class="font-semibold text-volt-300">{formatWeight(caught.weight_lb)}</span>
				{#if caught.carp_id && carpNames[caught.carp_id]}
					<a href="/carp/{caught.carp_id}" class="text-mist-100 hover:underline">{carpNames[caught.carp_id]}</a>
				{:else}
					<span class="text-mist-100">{UnnamedCarp}</span>
				{/if}
				{#if caught.angler_id}
					<a href="/anglers/{caught.angler_id}" class="text-mist-400 hover:underline">by {caught.angler_name}</a>
				{:else}
					<span class="text-mist-400">by {caught.angler_name}</span>
				{/if}
				<span class="text-mist-400">· {caught.swim_name} · {humanise(caught.rig)} · {humanise(caught.bait)} · size {caught.hook_size}</span>
				<span class="ml-auto text-xs text-mist-400">{formatWhen(caught.caught_at)}</span>
			</li>
		{/each}
	</ul>
{/if}
