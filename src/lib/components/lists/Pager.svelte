<script lang="ts">
	import { hasMorePages, Paging, type ListPage } from '$lib/domain/lists/paging';

	interface Props {
		page: ListPage<unknown>;
		noun: string;
		plural?: string;
		hrefFor: (page: number) => string;
	}

	let { page, noun, plural = `${noun}s`, hrefFor }: Props = $props();

	const hasPrevious = $derived(page.number > Paging.FirstPage);
	const hasNext = $derived(page.number < page.count);
	const totalWords = $derived(`${page.total} ${page.total === 1 ? noun : plural}`);
</script>

{#if hasMorePages(page)}
	<nav class="mt-6 flex items-center gap-3 text-sm text-mist-400" aria-label="Pages">
		{#if hasPrevious}<a href={hrefFor(page.number - 1)} class="button-secondary px-3 py-1 text-base">Previous</a>{/if}
		<span>Page {page.number} of {page.count} · {totalWords}</span>
		{#if hasNext}<a href={hrefFor(page.number + 1)} class="button-secondary px-3 py-1 text-base">Next</a>{/if}
	</nav>
{:else if page.total > 0}
	<p class="mt-6 text-sm text-mist-400">{totalWords}</p>
{/if}
