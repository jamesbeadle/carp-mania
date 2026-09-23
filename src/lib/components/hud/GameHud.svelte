<script lang="ts">
	import Wordmark from '../brand/Wordmark.svelte';
	import HudTabs from './HudTabs.svelte';
	import InboxBell from './InboxBell.svelte';
	import MoneyCounter from './MoneyCounter.svelte';
	import NewsLink from './NewsLink.svelte';
	import RuleBookLink from './RuleBookLink.svelte';
	import SoundToggle from './SoundToggle.svelte';
	import FullscreenToggle from './FullscreenToggle.svelte';

	interface Props {
		pathname: string;
		money: number;
		unreadCount: number;
		avatarUrl: string | null;
	}

	let { pathname, money, unreadCount, avatarUrl }: Props = $props();
</script>

<header class="hud sticky top-0 z-30 border-b border-carbon-700 bg-carbon-950/85 backdrop-blur">
	<div class="short:py-1 mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 lg:px-4">
		<a href="/home" class="mr-1 shrink-0 active:scale-95"><Wordmark size="text-xl lg:text-2xl" /></a>
		<HudTabs {pathname} />
		<div class="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
			<MoneyCounter {money} />
			<InboxBell {unreadCount} />
			<NewsLink />
			<RuleBookLink />
			<div class="hidden sm:block"><SoundToggle /></div>
			<FullscreenToggle />
			<a href="/angler" class="hidden h-9 w-9 overflow-hidden rounded-full border border-volt-500/60 bg-carbon-900 transition hover:border-volt-400 active:scale-95 lg:block" aria-label="My angler">
				{#if avatarUrl}<img src={avatarUrl} alt="" class="h-full w-full object-cover" referrerpolicy="no-referrer" />{/if}
			</a>
			<form method="POST" action="/auth/signout" class="hidden lg:block">
				<button class="text-xs text-mist-400 hover:text-mist-100">Sign out</button>
			</form>
		</div>
	</div>
</header>

<style>
	.hud {
		padding-top: env(safe-area-inset-top);
	}
</style>
