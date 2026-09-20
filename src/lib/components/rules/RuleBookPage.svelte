<script lang="ts">
	import { chaptersMatching, RuleBook } from '$lib/rules/ruleBook';
	import RuleBookContents from './RuleBookContents.svelte';
	import RuleChapterPanel from './RuleChapterPanel.svelte';

	let { isSignedIn }: { isSignedIn: boolean } = $props();

	let query = $state('');
	const chapters = $derived(chaptersMatching(query));
	const isSearching = $derived(query.trim().length > 0);
	const questionCount = RuleBook.reduce((total, chapter) => total + chapter.questions.length, 0);
</script>

<div class="mx-auto max-w-5xl pb-8">
	{#if !isSignedIn}<p class="stat-label"><a href="/" class="hover:text-mist-100">← Carp Mania</a></p>{/if}
	<h1 class="mt-2 text-4xl text-volt-300 sm:text-5xl">The rule book</h1>
	<p class="mt-2 max-w-2xl text-lg leading-relaxed text-mist-100">{questionCount} questions and answers about how the game works, written for a player who has never held a rod. Start at the top, or search for the thing you are stuck on.</p>
	<label class="mt-5 block max-w-md">
		<span class="stat-label">Search the rules</span>
		<input type="search" class="field mt-1" placeholder="strike, ticket, bailiff, rating…" bind:value={query} />
	</label>
	<div class="mt-6 grid gap-6 lg:grid-cols-[12rem_1fr]">
		<aside class="lg:sticky lg:top-20 lg:self-start"><RuleBookContents chapters={RuleBook} /></aside>
		<div class="grid gap-6">
			{#each chapters as chapter (chapter.id)}
				<RuleChapterPanel {chapter} isOpenedOut={isSearching} />
			{:else}
				<p class="text-sm text-mist-400">Nothing in the book says that. Try another word, or write to us — the address is under Fair play.</p>
			{/each}
		</div>
	</div>
</div>
