<script lang="ts">
	import { inboxParamsOf, type InboxFilters } from '$lib/domain/lists/inboxFilters';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { Paging } from '$lib/domain/lists/paging';

	interface Props {
		filters: InboxFilters;
		unreadCount: number;
		total: number;
	}

	let { filters, unreadCount, total }: Props = $props();

	const InboxPath = '/inbox';
	const everythingHref = listPathFor(InboxPath, inboxParamsOf({ isUnreadOnly: false, page: Paging.FirstPage }));
	const unreadHref = listPathFor(InboxPath, inboxParamsOf({ isUnreadOnly: true, page: Paging.FirstPage }));
	const choices = $derived([
		{ href: everythingHref, label: 'Everything', isChosen: !filters.isUnreadOnly, count: filters.isUnreadOnly ? null : total },
		{ href: unreadHref, label: 'New only', isChosen: filters.isUnreadOnly, count: unreadCount }
	]);
</script>

<nav class="mb-4 flex flex-wrap gap-2" aria-label="Which notes">
	{#each choices as choice (choice.label)}
		<a
			href={choice.href}
			class="rounded-full px-4 py-1.5 text-sm font-medium transition"
			class:bg-volt-500={choice.isChosen}
			class:text-carbon-950={choice.isChosen}
			class:bg-carbon-800={!choice.isChosen}
			class:text-mist-200={!choice.isChosen}
			aria-current={choice.isChosen ? 'page' : undefined}
		>
			{choice.label}{#if choice.count !== null}<span class="ml-1 opacity-70">{choice.count}</span>{/if}
		</a>
	{/each}
</nav>
