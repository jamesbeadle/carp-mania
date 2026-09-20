<script lang="ts">
	import { isWorldSort, WorldSortLabels, WorldSorts, type WorldFilters } from '$lib/domain/world/worldFilters';

	interface Props {
		filters: WorldFilters;
		onChange: (filters: WorldFilters) => void;
	}

	let { filters, onChange }: Props = $props();

	const toggles = [
		{ key: 'isOnTheBankOnly', label: 'Anglers on the bank' },
		{ key: 'isFavouritesOnly', label: 'My favourites' }
	] as const;

	const update = (patch: Partial<WorldFilters>) => onChange({ ...filters, ...patch });
	const chooseSort = (event: Event) => {
		const chosen = (event.currentTarget as HTMLSelectElement).value;
		if (isWorldSort(chosen)) update({ sort: chosen });
	};
</script>

<div class="flex flex-col gap-1.5 text-sm">
	{#each toggles as toggle (toggle.key)}
		<label class="flex items-center gap-2">
			<input type="checkbox" class="accent-volt-500" checked={filters[toggle.key]} onchange={(event) => update({ [toggle.key]: event.currentTarget.checked })} />
			<span class="text-mist-200">{toggle.label}</span>
		</label>
	{/each}
</div>
<label class="block">
	<span class="stat-label">Sort</span>
	<select class="field" value={filters.sort} onchange={chooseSort}>
		{#each WorldSorts as sort (sort)}
			<option value={sort}>{WorldSortLabels[sort]}</option>
		{/each}
	</select>
</label>
