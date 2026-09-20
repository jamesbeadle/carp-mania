<script lang="ts">
	import type { AwardProgress } from '$lib/domain/trophies/awardProgress';
	import AwardProgressRow from './AwardProgressRow.svelte';

	let { next }: { next: AwardProgress[] } = $props();
</script>

<section class="panel">
	<h2 class="mb-3 text-xl text-volt-300">The next ones</h2>
	{#if next.length === 0}
		<p class="text-sm text-mist-400">Every award is won. There is nothing left but the fishing.</p>
	{:else}
		<ul class="space-y-3">
			{#each next as progress (progress.key)}<AwardProgressRow {progress} />{/each}
		</ul>
	{/if}
</section>
