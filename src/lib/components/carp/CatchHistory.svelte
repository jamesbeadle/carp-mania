<script lang="ts">
	import type { Catch } from '$lib/domain/types';
	import { formatWhen } from '$lib/format/dates';
	import { humanise } from '$lib/format/labels';
	import { formatWeight } from '$lib/format/weight';

	let { catches }: { catches: Catch[] } = $props();
</script>

{#if catches.length === 0}
	<p class="text-sm text-mist-400">Never been on the bank.</p>
{:else}
	<ul class="divide-y divide-carbon-700/60">
		{#each catches as caught (caught.id)}
			<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
				<span class="font-semibold text-volt-300">{formatWeight(caught.weight_lb)}</span>
				{#if caught.angler_id}
					<a href="/anglers/{caught.angler_id}" class="text-mist-100 hover:underline">{caught.angler_name}</a>
				{:else}
					<span class="text-mist-100">{caught.angler_name}</span>
				{/if}
				<span class="text-mist-400">· {caught.swim_name} · {humanise(caught.rig)} · {humanise(caught.bait)}</span>
				<span class="ml-auto text-xs text-mist-400">{formatWhen(caught.caught_at)}</span>
			</li>
		{/each}
	</ul>
{/if}
