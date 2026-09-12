<script lang="ts">
	import { LegalContact } from '$lib/legal/legalPages';

	let { words }: { words: string } = $props();

	const parts = $derived(words.split(LegalContact.email));
</script>

<p class="mb-3 leading-relaxed text-mist-200">
	{#each parts as part, index (index)}{part}{#if index < parts.length - 1}<a href="mailto:{LegalContact.email}" class="text-surge-400 hover:underline">{LegalContact.email}</a>{/if}{/each}
</p>
