<script lang="ts">
	import { WorldScope, type Leaderboards } from '$lib/contracts/Leaderboards';
	import type { RegionCode } from '$lib/domain/world/regionCodes';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { boardsFrom } from '$lib/game/world/leaderboardRows';
	import LeaderboardTable from './LeaderboardTable.svelte';

	let { region }: { region: RegionCode | null } = $props();

	const LeaderboardsPath = '/world/leaderboards';
	const CouldNotLoad = 'The boards would not load. Try again in a moment.';

	let leaderboards = $state<Leaderboards | null>(null);
	let failure = $state<string | null>(null);

	const scope = $derived(region ?? WorldScope);
	const scopeLabel = $derived(region ? RegionCatalogue[region].label : 'The whole world');
	const boards = $derived(leaderboards ? boardsFrom(leaderboards) : []);

	$effect(() => {
		loadLeaderboards(scope);
	});

	async function loadLeaderboards(wantedScope: string) {
		leaderboards = null;
		failure = null;
		const response = await fetch(`${LeaderboardsPath}?region=${wantedScope}`);
		if (wantedScope !== scope) return;
		if (!response.ok) return showFailure();
		leaderboards = (await response.json()) as Leaderboards;
	}

	function showFailure() {
		failure = CouldNotLoad;
	}
</script>

<p class="stat-label">{scopeLabel}</p>
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
