<script lang="ts">
	import InboxBadge from '../inbox/InboxBadge.svelte';

	let { unreadCount }: { unreadCount: number } = $props();
</script>

<a href="/inbox" class="relative flex h-9 w-9 items-center justify-center rounded-full border border-carbon-600 bg-carbon-900/80 text-mist-200 transition hover:border-volt-400 hover:text-volt-300 active:scale-95" aria-label="Inbox, {unreadCount} unread">
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
	{#if unreadCount > 0}<span class="absolute -top-1.5 -right-1.5"><InboxBadge count={unreadCount} /></span>{/if}
</a>
