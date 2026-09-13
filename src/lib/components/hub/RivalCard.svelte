<script lang="ts">
	import type { MyRival } from '$lib/contracts/Rivalry';
	import { chaserLine, NobodyAbove, placeLine, toBeatLine } from '$lib/domain/world/rivalWords';
	import { standingWords } from '$lib/domain/world/standingWords';
	import AnglerAvatar from '../angler/AnglerAvatar.svelte';

	let { rival }: { rival: MyRival } = $props();

	const chaser = $derived(chaserLine(rival));
	const isOnTheLadder = $derived(rival.standing.bestLb > 0);
</script>

<section class="panel">
	<p class="stat-label">The one to beat</p>
	{#if rival.above}
		<a href="/anglers/{rival.above.anglerId}" class="mt-1 flex items-center gap-3">
			<AnglerAvatar avatarUrl={rival.above.avatarUrl} name={rival.above.displayName} />
			<span class="min-w-0">
				<span class="block truncate text-2xl text-volt-300 hover:underline">{rival.above.displayName}</span>
				<span class="block text-sm text-mist-400">{placeLine(rival.above)}</span>
			</span>
		</a>
	{:else}
		<h2 class="mt-1 text-2xl text-volt-300">{NobodyAbove}</h2>
	{/if}
	<p class="mt-3 text-mist-100">{toBeatLine(rival)}</p>
	{#if isOnTheLadder}<p class="mt-1 text-sm text-mist-400">{standingWords(rival.standing, null)}</p>{/if}
	{#if chaser}<p class="text-sm text-mist-400">{chaser}</p>{/if}
	<a href="/world/hall-of-fame" class="mt-3 inline-block text-sm text-surge-400 hover:underline">The world board →</a>
</section>
