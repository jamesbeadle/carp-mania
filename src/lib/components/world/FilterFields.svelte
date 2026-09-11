<script lang="ts">
	import { isRegionCode, RegionCodes } from '$lib/domain/world/regionCodes';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import type { WorldFilters } from '$lib/domain/world/worldFilters';
	import { numberOrNull } from '$lib/game/world/worldUrl';

	interface Props {
		filters: WorldFilters;
		onChange: (filters: WorldFilters) => void;
	}

	let { filters, onChange }: Props = $props();

	const AllRegions = '';

	const update = (patch: Partial<WorldFilters>) => onChange({ ...filters, ...patch });
	const valueOf = (event: Event) => (event.currentTarget as HTMLInputElement | HTMLSelectElement).value;
	const chooseRegion = (event: Event) => {
		const chosen = valueOf(event);
		update({ region: isRegionCode(chosen) ? chosen : null });
	};
</script>

<label class="block">
	<span class="stat-label">Search lake or owner</span>
	<input type="search" class="field" placeholder="Bluebell Pit, Sam…" value={filters.search} oninput={(event) => update({ search: valueOf(event) })} />
</label>
<label class="block">
	<span class="stat-label">Region</span>
	<select class="field" value={filters.region ?? AllRegions} onchange={chooseRegion}>
		<option value={AllRegions}>All the world</option>
		{#each RegionCodes as code (code)}
			<option value={code}>{RegionCatalogue[code].label}</option>
		{/each}
	</select>
</label>
<div class="grid grid-cols-3 gap-2">
	<label class="block">
		<span class="stat-label">Reputation ≥</span>
		<input type="number" min="0" max="100" class="field px-2" value={filters.minimumReputation ?? ''} oninput={(event) => update({ minimumReputation: numberOrNull(valueOf(event)) })} />
	</label>
	<label class="block">
		<span class="stat-label">Biggest ≥ lb</span>
		<input type="number" min="0" class="field px-2" value={filters.minimumHeaviestLb ?? ''} oninput={(event) => update({ minimumHeaviestLb: numberOrNull(valueOf(event)) })} />
	</label>
	<label class="block">
		<span class="stat-label">Ticket ≤ £</span>
		<input type="number" min="0" class="field px-2" value={filters.maximumDayTicketFee ?? ''} oninput={(event) => update({ maximumDayTicketFee: numberOrNull(valueOf(event)) })} />
	</label>
</div>
