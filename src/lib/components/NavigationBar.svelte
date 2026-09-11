<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import { page } from '$app/state';
	import Wordmark from './brand/Wordmark.svelte';

	let { user }: { user: User } = $props();

	const links = [
		{ href: '/home', label: 'Home' },
		{ href: '/lake', label: 'My fishery' },
		{ href: '/lakes', label: 'Go fishing' },
		{ href: '/angler', label: 'My angler' }
	];

	const isCurrent = (href: string) => page.url.pathname.startsWith(href);
	const avatarUrl = $derived((user.user_metadata?.avatar_url as string | undefined) ?? null);
</script>

<header class="border-b border-carbon-700 bg-carbon-950/90 backdrop-blur">
	<nav class="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
		<a href="/home" class="mr-5"><Wordmark /></a>
		{#each links as link (link.href)}
			<a
				href={link.href}
				class="rounded-md px-3 py-1.5 font-display text-base font-bold tracking-wide uppercase transition hover:text-volt-400"
				class:text-volt-500={isCurrent(link.href)}
				class:text-mist-200={!isCurrent(link.href)}
				class:border-b-2={isCurrent(link.href)}
				class:border-volt-500={isCurrent(link.href)}>{link.label}</a
			>
		{/each}
		<form method="POST" action="/auth/signout" class="ml-auto flex items-center gap-3">
			{#if avatarUrl}
				<img src={avatarUrl} alt="" class="h-8 w-8 rounded-full border border-volt-500/60" referrerpolicy="no-referrer" />
			{/if}
			<button class="text-sm text-mist-400 hover:text-mist-100">Sign out</button>
		</form>
	</nav>
</header>
