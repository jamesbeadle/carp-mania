<script lang="ts">
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import type { WorldFilters } from '$lib/domain/world/worldFilters';
	import FilterFields from './FilterFields.svelte';
	import FilterToggles from './FilterToggles.svelte';
	import FlyToButtons, { type FlyToTarget } from './FlyToButtons.svelte';
	import Leaderboards from './Leaderboards.svelte';
	import MatchList from './MatchList.svelte';

	interface Props {
		filters: WorldFilters;
		matches: WorldPin[];
		totalCount: number;
		selectedPinId: string | null;
		hasMyWater: boolean;
		onChange: (filters: WorldFilters) => void;
		onFlyTo: (target: FlyToTarget) => void;
		onPick: (pin: WorldPin) => void;
	}

	let { filters, matches, totalCount, selectedPinId, hasMyWater, onChange, onFlyTo, onPick }: Props = $props();

	const tabs = ['Find a water', 'Leaderboards'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Find a water');
</script>

<aside class="panel flex flex-col gap-4">
	<nav class="flex gap-2">
		{#each tabs as tab (tab)}
			<button class="rounded-full px-3 py-1 text-sm font-medium transition" class:bg-volt-500={activeTab === tab} class:text-carbon-950={activeTab === tab} class:bg-carbon-900={activeTab !== tab} onclick={() => (activeTab = tab)}>{tab}</button>
		{/each}
	</nav>
	{#if activeTab === 'Find a water'}
		<FilterFields {filters} {onChange} />
		<FilterToggles {filters} {onChange} />
		<FlyToButtons {hasMyWater} hasPins={totalCount > 0} {onFlyTo} />
		<MatchList {matches} {totalCount} {selectedPinId} {onPick} />
	{:else}
		<Leaderboards region={filters.region} />
	{/if}
</aside>
