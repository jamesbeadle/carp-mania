<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import NotificationList from '$lib/components/inbox/NotificationList.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';

	let { data, form } = $props();

	const unreadCount = $derived(data.inbox.unreadCount);
	const unreadLine = $derived(unreadCount === 0 ? 'Nothing new pinned up.' : `${unreadCount} new ${unreadCount === 1 ? 'note' : 'notes'} pinned up.`);
</script>

<svelte:head><title>The noticeboard · Carp Mania</title></svelte:head>

{#snippet takeThemAllDown()}
	<form method="POST" action="?/markAllRead">
		<button class="button-secondary">Take them all down</button>
	</form>
{/snippet}

<PlaceBanner kind="noticeboard" title="The noticeboard" blurb="{unreadLine} Outbids, sales, arrivals, finished works, matches and records set on your water." noteCount={Math.max(1, unreadCount)} actions={unreadCount > 0 ? takeThemAllDown : undefined} />

<ActionMessage {form} />
<NotificationList notifications={data.inbox.notifications} />
