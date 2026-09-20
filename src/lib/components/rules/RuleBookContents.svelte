<script lang="ts">
	import type { RuleChapter } from '$lib/rules/ruleBookTypes';

	let { chapters }: { chapters: RuleChapter[] } = $props();
</script>

<nav class="flex flex-wrap gap-2 lg:flex-col lg:gap-1" aria-label="Chapters">
	{#each chapters as chapter (chapter.id)}
		<a href="#{chapter.id}" class="rounded-full border border-carbon-700 bg-carbon-900/70 px-3 py-1 font-display text-sm font-bold tracking-wide text-mist-200 uppercase transition hover:border-volt-400 hover:text-volt-300 lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-2">{chapter.title}</a>
	{/each}
</nav>
