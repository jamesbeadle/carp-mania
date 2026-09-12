<script lang="ts">
	import { AnglerSorts, type AnglerFilters } from '$lib/domain/lists/anglerFilters';
	import { RegionCodes } from '$lib/domain/world/regionCodes';
	import { RegionCatalogue } from '$lib/domain/world/regions';

	let { filters }: { filters: AnglerFilters } = $props();

	const AnyRegion = '';
</script>

<form method="GET" class="mb-6 flex flex-wrap items-end gap-3" data-sveltekit-keepfocus>
	<label class="min-w-40 flex-1">
		<span class="stat-label">Find an angler</span>
		<input name="search" class="field mt-1" placeholder="By name" value={filters.search} />
	</label>
	<label>
		<span class="stat-label">Home region</span>
		<select name="region" class="field mt-1">
			<option value={AnyRegion} selected={filters.region === null}>Anywhere</option>
			{#each RegionCodes as region (region)}<option value={region} selected={filters.region === region}>{RegionCatalogue[region].label}</option>{/each}
		</select>
	</label>
	<label>
		<span class="stat-label">Sort</span>
		<select name="sort" class="field mt-1">
			{#each AnglerSorts as choice (choice.sort)}<option value={choice.sort} selected={filters.sort === choice.sort}>{choice.label}</option>{/each}
		</select>
	</label>
	<button class="button-secondary">Show</button>
</form>
