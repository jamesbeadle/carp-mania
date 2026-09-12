<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import InboxFilterBar from '$lib/components/inbox/InboxFilterBar.svelte';
	import NotificationList from '$lib/components/inbox/NotificationList.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import { inboxParamsOf } from '$lib/domain/lists/inboxFilters';
	import { actionPathFor, listPathFor } from '$lib/domain/lists/listPath';

	let { data, form } = $props();

	const InboxPath = '/inbox';
	const inbox = $derived(data.inbox);
	const unreadCount = $derived(inbox.unreadCount);
	const unreadLine = $derived(unreadCount === 0 ? 'Nothing new pinned up.' : `${unreadCount} new ${unreadCount === 1 ? 'note' : 'notes'} pinned up.`);
	const params = $derived(inboxParamsOf(inbox.filters));
	const hrefFor = (page: number) => listPathFor(InboxPath, params, page);
	const markReadAction = $derived(actionPathFor('markRead', params, inbox.notes.number));
	const markAllReadAction = $derived(actionPathFor('markAllRead', params));
</script>

<svelte:head><title>The noticeboard · Carp Mania</title></svelte:head>

{#snippet takeThemAllDown()}
	<form method="POST" action={markAllReadAction}>
		<button class="button-secondary">Take them all down</button>
	</form>
{/snippet}

<PlaceBanner kind="noticeboard" title="The noticeboard" blurb="{unreadLine} Outbids, sales, arrivals, finished works, matches and records set on your water." noteCount={Math.max(1, unreadCount)} actions={unreadCount > 0 ? takeThemAllDown : undefined} />

<ActionMessage {form} />
<InboxFilterBar filters={inbox.filters} {unreadCount} total={inbox.notes.total} />
<NotificationList notifications={inbox.notes.items} isUnreadOnly={inbox.filters.isUnreadOnly} {markReadAction} />
<Pager page={inbox.notes} noun="note" {hrefFor} />
