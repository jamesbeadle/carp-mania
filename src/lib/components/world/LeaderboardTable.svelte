<script lang="ts">
	import type { LeaderboardBoard } from '$lib/game/world/leaderboardRows';

	let { board }: { board: LeaderboardBoard } = $props();
</script>

<section>
	<h3 class="mb-1 text-lg text-volt-300">{board.title}</h3>
	{#if board.rows.length === 0}
		<p class="text-xs text-mist-400">Nothing on the board yet.</p>
	{:else}
		<ol class="divide-y divide-carbon-700/60 text-sm">
			{#each board.rows as row, index (row.key)}
				<li class="flex items-baseline gap-2 py-1">
					<span class="w-5 shrink-0 text-xs text-mist-400">{index + 1}.</span>
					<span class="min-w-0 truncate">
						{#if row.href}
							<a href={row.href} class="text-mist-100 hover:text-volt-300 hover:underline">{row.label}</a>
						{:else}
							<span class="text-mist-100">{row.label}</span>
						{/if}
						<span class="block truncate text-xs text-mist-400">{row.detail}</span>
					</span>
					<span class="ml-auto whitespace-nowrap text-volt-300">{row.value}</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
