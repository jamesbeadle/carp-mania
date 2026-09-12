<script lang="ts">
	import { diaryAgeOf, placeInTheLine } from '$lib/domain/legacy/diary';
	import type { Fisherman } from '$lib/domain/legacy/fishermanTypes';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';

	let { line, currentId }: { line: Fisherman[]; currentId: string } = $props();

	const now = new Date();
</script>

<section class="panel">
	<h2 class="mb-1 text-xl text-volt-300">The line</h2>
	<p class="mb-3 text-xs text-mist-400">Every fisherman who has held the rods. Each keeps a scrapbook of their own catches.</p>
	<ol class="divide-y divide-carbon-700/60">
		{#each line as fisherman (fisherman.id)}
			<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
				<span class="font-display text-lg font-bold text-surge-500 italic tabular-nums">{fisherman.generation}</span>
				<a href="/angler/scrapbook/{fisherman.id}" class="text-mist-100 hover:underline">{fisherman.name}</a>
				<span class="text-mist-400">{placeInTheLine(fisherman.generation)}</span>
				{#if fisherman.id === currentId}
					<span class="text-volt-300">aged {diaryAgeOf(fisherman, now)} · still fishing</span>
				{:else}
					<span class="text-mist-400">retired at {diaryAgeOf(fisherman, now)}{#if fisherman.retired_at}, {formatWhen(fisherman.retired_at)}{/if} · {fisherman.catches ?? 0} landed · best {formatWeight(fisherman.personal_best_lb ?? 0)}</span>
				{/if}
			</li>
		{/each}
	</ol>
</section>
