<script lang="ts">
	import type { RuleChapter } from '$lib/rules/ruleBookTypes';
	import RuleQuestion from './RuleQuestion.svelte';

	let { chapter, isOpenedOut = false }: { chapter: RuleChapter; isOpenedOut?: boolean } = $props();
</script>

<section id={chapter.id} class="panel scroll-mt-24">
	<h2 class="text-2xl text-volt-300">{chapter.title}</h2>
	<p class="mb-3 text-sm text-mist-400">{chapter.blurb}</p>
	{#each chapter.questions as entry (entry.question)}
		<RuleQuestion {entry} isOpen={isOpenedOut} />
	{/each}
</section>
