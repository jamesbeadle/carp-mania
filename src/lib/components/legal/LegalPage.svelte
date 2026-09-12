<script lang="ts">
	import { LegalPages, type LegalDocument } from '$lib/legal/legalPages';
	import LegalParagraph from './LegalParagraph.svelte';

	let { document }: { document: LegalDocument } = $props();

	const otherPages = $derived(LegalPages.filter((page) => page.label !== document.title));
</script>

<article class="mx-auto max-w-3xl pb-8">
	<p class="stat-label"><a href="/" class="hover:text-mist-100">← Carp Mania</a></p>
	<h1 class="mt-2 text-5xl text-volt-300">{document.title}</h1>
	<p class="mt-1 text-sm text-mist-400">Last updated {document.updatedOn}</p>
	<p class="mt-6 text-lg leading-relaxed text-mist-100">{document.summary}</p>
	{#each document.sections as section (section.heading)}
		<section class="mt-8">
			<h2 class="mb-2 text-2xl text-volt-300">{section.heading}</h2>
			{#each section.paragraphs as paragraph, index (index)}
				<LegalParagraph words={paragraph} />
			{/each}
		</section>
	{/each}
	<nav class="mt-10 flex flex-wrap gap-4 border-t border-carbon-700 pt-4 text-sm text-mist-400" aria-label="Also">
		{#each otherPages as page (page.path)}<a href={page.path} class="hover:text-mist-100">{page.label}</a>{/each}
		<a href="/" class="hover:text-mist-100">Back to the game</a>
	</nav>
</article>
