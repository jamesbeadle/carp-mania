<script lang="ts">
	import { WorldScope, type LeaderboardScope } from '$lib/contracts/Leaderboards';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import type { RegionCode } from '$lib/domain/world/regionCodes';

	let { scope, basePath }: { scope: LeaderboardScope; basePath: string } = $props();

	const scopes: LeaderboardScope[] = [WorldScope, ...(Object.keys(RegionCatalogue) as RegionCode[])];
	const hrefFor = (wanted: LeaderboardScope) => (wanted === WorldScope ? basePath : `${basePath}?region=${wanted}`);
	const labelFor = (wanted: LeaderboardScope) => (wanted === WorldScope ? 'The world' : RegionCatalogue[wanted].label);
</script>

<nav class="flex flex-wrap gap-1" aria-label="Scope">
	{#each scopes as candidate (candidate)}
		{@const isCurrent = candidate === scope}
		<a href={hrefFor(candidate)} class="rounded-full px-3 py-1 font-display text-sm font-bold tracking-wide uppercase transition active:scale-95" class:bg-volt-500={isCurrent} class:text-carbon-950={isCurrent} class:text-mist-200={!isCurrent} class:hover:bg-carbon-700={!isCurrent} aria-current={isCurrent ? 'page' : undefined}>
			{labelFor(candidate)}
		</a>
	{/each}
</nav>
