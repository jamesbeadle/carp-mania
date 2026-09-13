<script lang="ts">
	import type { Notification } from '$lib/domain/worldTypes';
	import { formatWhen } from '$lib/format/dates';

	let { notifications, unreadCount }: { notifications: Notification[]; unreadCount: number } = $props();

	const headline = $derived(unreadCount === 0 ? 'Nothing new' : `${unreadCount} unread`);
	const moreCount = $derived(Math.max(0, unreadCount - notifications.length));
</script>

<section class="panel">
	<p class="stat-label">Inbox</p>
	<h2 class="mb-4 text-3xl text-volt-300">{headline}</h2>
	{#if unreadCount === 0}
		<p class="text-sm text-mist-400">Outbids, sales, arrivals, finished works, records set on your water and records taken from you land here.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each notifications as notification (notification.id)}
				<li class="flex items-baseline gap-3 py-2">
					<a href={notification.link} class="text-mist-100 hover:underline">{notification.title}</a>
					<span class="ml-auto text-xs whitespace-nowrap text-mist-400">{formatWhen(notification.created_at)}</span>
				</li>
			{/each}
		</ul>
		{#if moreCount > 0}
			<p class="mt-2 text-xs text-mist-400">and {moreCount} more</p>
		{/if}
	{/if}
	<div class="mt-5 flex gap-3">
		<a href="/inbox" class="button-secondary">Open the inbox</a>
	</div>
</section>
