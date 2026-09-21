<script lang="ts">
	import { FacilityCatalogue } from '$lib/domain/groundworks/facilities';
	import { Facilities, type Facility } from '$lib/domain/layout/layoutTypes';
	import FacilityGlyph from './FacilityGlyph.svelte';

	let { built, emptyWords = null }: { built: Facility[]; emptyWords?: string | null } = $props();

	const inOrder = $derived(Facilities.filter((facility) => built.includes(facility)));
</script>

{#if inOrder.length > 0}
	<ul class="flex flex-wrap gap-1.5" aria-label="Facilities">
		{#each inOrder as facility (facility)}
			<li class="flex items-center gap-1 rounded-full border border-carbon-600 bg-carbon-900 px-2 py-0.5 text-xs text-mist-200" title={FacilityCatalogue[facility].blurb}>
				<span class="text-volt-300"><FacilityGlyph {facility} size={13} /></span>
				{FacilityCatalogue[facility].label}
			</li>
		{/each}
	</ul>
{:else if emptyWords}
	<p class="text-xs text-mist-400">{emptyWords}</p>
{/if}
