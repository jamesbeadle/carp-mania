<script lang="ts">
	import { isRegionCode, RegionCodes } from '$lib/domain/world/regionCodes';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { isWorldSort, WorldSortLabels, WorldSorts, type WorldFilters } from '$lib/domain/world/worldFilters';
	import type { FlyToTarget } from '$lib/game/world/flyTo';

	interface Props {
		filters: WorldFilters;
		shownCount: number;
		totalCount: number;
		hasMyWater: boolean;
		onChange: (filters: WorldFilters) => void;
		onFlyTo: (target: FlyToTarget) => void;
	}

	let { filters, shownCount, totalCount, hasMyWater, onChange, onFlyTo }: Props = $props();

	const AllRegions = '';
	const update = (patch: Partial<WorldFilters>) => onChange({ ...filters, ...patch });
	const valueOf = (event: Event) => (event.currentTarget as HTMLInputElement | HTMLSelectElement).value;
	const chooseRegion = (event: Event) => update({ region: isRegionCode(valueOf(event)) ? (valueOf(event) as WorldFilters['region']) : null });
	const chooseSort = (event: Event) => {
		const chosen = valueOf(event);
		if (isWorldSort(chosen)) update({ sort: chosen });
	};
	const toggles = [
		{ key: 'isOnTheBankOnly', label: 'Anglers on the bank' },
		{ key: 'isFavouritesOnly', label: 'My favourites' }
	] as const;
	const flights: { target: FlyToTarget; label: string; isAvailable: boolean }[] = $derived([
		{ target: 'my_water', label: 'My water', isAvailable: hasMyWater },
		{ target: 'biggest_fish', label: 'Biggest fish alive', isAvailable: totalCount > 0 },
		{ target: 'somewhere_new', label: 'Somewhere new', isAvailable: true }
	]);
	const countWords = $derived(shownCount === totalCount ? `${totalCount} waters` : `${shownCount} of ${totalCount} waters`);
</script>

<div class="flex flex-wrap items-center gap-2">
	<input type="search" class="field w-48 py-1.5 text-sm" placeholder="Lake or owner…" aria-label="Search lake or owner" value={filters.search} oninput={(event) => update({ search: valueOf(event) })} />
	<select class="field w-44 py-1.5 text-sm" aria-label="Region" value={filters.region ?? AllRegions} onchange={chooseRegion}>
		<option value={AllRegions}>All the world</option>
		{#each RegionCodes as code (code)}<option value={code}>{RegionCatalogue[code].label}</option>{/each}
	</select>
	<select class="field w-36 py-1.5 text-sm" aria-label="Sort" value={filters.sort} onchange={chooseSort}>
		{#each WorldSorts as sort (sort)}<option value={sort}>{WorldSortLabels[sort]}</option>{/each}
	</select>
	{#each toggles as toggle (toggle.key)}
		<button type="button" class="rounded-full border px-3 py-1 text-xs transition" class:border-volt-500={filters[toggle.key]} class:text-volt-300={filters[toggle.key]} class:border-carbon-600={!filters[toggle.key]} class:text-mist-200={!filters[toggle.key]} aria-pressed={filters[toggle.key]} onclick={() => update({ [toggle.key]: !filters[toggle.key] })}>{toggle.label}</button>
	{/each}
	<span class="text-xs text-mist-400">{countWords}</span>
	<div class="ml-auto flex flex-wrap gap-1.5">
		{#each flights as flight (flight.target)}
			<button class="rounded-md border border-carbon-700 px-3 py-1 font-display text-sm font-bold tracking-wide text-mist-100 uppercase italic transition hover:border-volt-500 hover:text-volt-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={!flight.isAvailable} onclick={() => onFlyTo(flight.target)}>▸ {flight.label}</button>
		{/each}
	</div>
</div>
