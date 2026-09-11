<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import { page } from '$app/state';

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

<header class="border-b border-pond-700 bg-pond-950/80 backdrop-blur">
	<nav class="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
		<a href="/home" class="mr-4 font-display text-2xl text-gold-400">Carp Mania</a>
		{#each links as link (link.href)}
			<a
				href={link.href}
				class="rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-pond-800"
				class:bg-pond-800={isCurrent(link.href)}
				class:text-gold-300={isCurrent(link.href)}>{link.label}</a
			>
		{/each}
		<form method="POST" action="/auth/signout" class="ml-auto flex items-center gap-3">
			{#if avatarUrl}
				<img src={avatarUrl} alt="" class="h-8 w-8 rounded-full border border-pond-600" referrerpolicy="no-referrer" />
			{/if}
			<button class="text-sm text-mist-400 hover:text-mist-100">Sign out</button>
		</form>
	</nav>
</header>
