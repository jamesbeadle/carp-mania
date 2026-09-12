<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import NotificationList from '$lib/components/inbox/NotificationList.svelte';

	let { data, form } = $props();

	const unreadCount = $derived(data.inbox.unreadCount);
	const unreadLine = $derived(unreadCount === 0 ? 'All read.' : `${unreadCount} unread.`);
</script>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">Inbox</h1>
		<p class="text-mist-400">{unreadLine} Outbids, sales, arrivals, finished works and records set on your water.</p>
	</div>
	{#if unreadCount > 0}
		<form method="POST" action="?/markAllRead" class="ml-auto">
			<button class="button-secondary">Mark all read</button>
		</form>
	{/if}
</div>

<ActionMessage {form} />
<NotificationList notifications={data.inbox.notifications} />
