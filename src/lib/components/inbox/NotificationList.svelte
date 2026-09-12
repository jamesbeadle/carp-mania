<script lang="ts">
	import type { Notification } from '$lib/domain/worldTypes';
	import NotificationRow from './NotificationRow.svelte';

	let { notifications }: { notifications: Notification[] } = $props();
</script>

{#if notifications.length === 0}
	<section class="panel">
		<p class="text-mist-100">Nothing in the post.</p>
		<p class="mt-1 text-sm text-mist-400">When you are outbid, when a fish sells or arrives, when the diggers finish or somebody sets a record on your water, it lands here.</p>
	</section>
{:else}
	<ul class="grid gap-3">
		{#each notifications as notification (notification.id)}
			<NotificationRow {notification} />
		{/each}
	</ul>
{/if}
