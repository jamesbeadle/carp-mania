<script lang="ts">
	import { page } from '$app/state';
	import { BoardLengths, leaderboardsPathFor, WorldScope, type BoardLength, type Leaderboards } from '$lib/contracts/Leaderboards';
	import type { RegionCode } from '$lib/domain/world/regionCodes';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { boardsFrom } from '$lib/game/world/leaderboardRows';
	import LeaderboardTable from './LeaderboardTable.svelte';

	let { region }: { region: RegionCode | null } = $props();

	const CouldNotLoad = 'The boards would not load. Try again in a moment.';

	let leaderboards = $state<Leaderboards | null>(null);
	let failure = $state<string | null>(null);
	let top = $state<BoardLength>(BoardLengths[0]);

	const scope = $derived(region ?? WorldScope);
	const scopeLabel = $derived(region ? RegionCatalogue[region].label : 'The whole world');
	const viewerId = $derived(page.data.user?.id ?? null);
	const boards = $derived(leaderboards ? boardsFrom(leaderboards, viewerId) : []);

	$effect(() => {
		loadLeaderboards(leaderboardsPathFor(scope, top));
	});

	async function loadLeaderboards(path: string) {
		leaderboards = null;
		failure = null;
		const response = await fetch(path);
		if (path !== leaderboardsPathFor(scope, top)) return;
		if (!response.ok) return showFailure();
		leaderboards = (await response.json()) as Leaderboards;
	}

	function showFailure() {
		failure = CouldNotLoad;
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<p class="stat-label">{scopeLabel}</p>
	<div class="ml-auto flex gap-1" role="group" aria-label="Board length">
		{#each BoardLengths as length (length)}
			<button
				class="rounded-full px-2 py-0.5 text-xs font-medium transition"
				class:bg-volt-500={top === length}
				class:text-carbon-950={top === length}
				class:bg-carbon-800={top !== length}
				class:text-mist-400={top !== length}
				aria-pressed={top === length}
				onclick={() => (top = length)}>Top {length}</button
			>
		{/each}
	</div>
</div>
{#if failure}
	<p class="text-sm text-danger-400">{failure}</p>
{:else if !leaderboards}
	<p class="text-sm text-mist-400">Ranking the world…</p>
{:else}
	<div class="flex flex-col gap-4">
		{#each boards as board (board.title)}
			<LeaderboardTable {board} />
		{/each}
	</div>
{/if}
