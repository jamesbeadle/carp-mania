<script lang="ts">
	import type { Notification } from '$lib/domain/worldTypes';
	import { formatWhen } from '$lib/format/dates';
	import { humanise } from '$lib/format/labels';

	let { notification }: { notification: Notification } = $props();

	const isUnread = $derived(notification.read_at === null);
</script>

<li class={['panel flex flex-wrap items-start gap-x-4 gap-y-3', isUnread && 'border-volt-500/40']}>
	<div class="min-w-0 flex-1">
		<p class="stat-label">{humanise(notification.kind)} · {formatWhen(notification.created_at)}</p>
		<h2 class="text-xl" class:text-volt-300={isUnread} class:text-mist-200={!isUnread}>{notification.title}</h2>
		<p class="mt-1 text-sm text-mist-200">{notification.body}</p>
	</div>
	<div class="flex items-center gap-3">
		<a href={notification.link} class="button-secondary px-3 py-1 text-base">Open</a>
		{#if isUnread}
			<form method="POST" action="?/markRead">
				<input type="hidden" name="notificationId" value={notification.id} />
				<button class="text-sm text-mist-400 hover:text-mist-100">Mark read</button>
			</form>
		{/if}
	</div>
</li>
