<script lang="ts">
	import FameBadge from '$lib/components/carp/FameBadge.svelte';
	import type { FamousFish } from '$lib/contracts/AnglerPublicProfile';
	import { StrainCatalogue } from '$lib/domain/strains';
	import { formatWeight } from '$lib/format/weight';

	let { fish }: { fish: FamousFish[] } = $props();
</script>

{#if fish.length === 0}
	<p class="text-sm text-mist-400">No famous fish yet. Fame comes from records, repeat captures and the anglers who catch them.</p>
{:else}
	<ul class="divide-y divide-carbon-700/60">
		{#each fish as famous (famous.id)}
			<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
				<a href="/carp/{famous.id}" class="font-medium text-mist-100 hover:underline">{famous.name}</a>
				<span class="text-mist-400">{StrainCatalogue[famous.strain].label} · {formatWeight(famous.weightLb)}</span>
				<a href="/lakes/{famous.lakeId}" class="text-mist-400 hover:underline">{famous.lakeName}</a>
				<span class="ml-auto"><FameBadge fame={famous.fame} /></span>
			</li>
		{/each}
	</ul>
{/if}
