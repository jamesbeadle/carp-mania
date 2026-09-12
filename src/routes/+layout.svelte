<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import '../app.css';
	import BottomTabBar from '$lib/components/hud/BottomTabBar.svelte';
	import GameHud from '$lib/components/hud/GameHud.svelte';
	import { sound } from '$lib/game/sound/soundEngine.svelte';

	let { data, children } = $props();

	const ScreenEntrance = { Milliseconds: 220, Distance: 10 } as const;

	const pathname = $derived(page.url.pathname);
	const isStage = $derived(page.data.isStage === true);
	const isImmersive = $derived(page.data.isImmersive === true);
	const hasChrome = $derived(data.user !== null && !isImmersive);
	const avatarUrl = $derived((data.user?.user_metadata?.avatar_url as string | undefined) ?? null);

	function unlockSound() {
		sound.unlock();
	}

	function tapSound(event: MouseEvent) {
		const target = event.target instanceof Element ? event.target : null;
		if (target?.closest('button, a[href]')) sound.play('tap');
	}
</script>

<svelte:window onpointerdowncapture={unlockSound} onkeydowncapture={unlockSound} onclickcapture={tapSound} />

<div class="flex min-h-dvh flex-col" class:h-dvh={isStage} class:overflow-hidden={isStage}>
	{#if hasChrome}
		<GameHud {pathname} money={data.hud.money} unreadCount={data.unreadCount} {avatarUrl} />
	{/if}
	<main class={isStage ? 'relative min-h-0 flex-1' : 'mx-auto w-full max-w-6xl flex-1 px-4 py-6'}>
		{#key pathname}
			<div class="h-full" in:fly={{ y: ScreenEntrance.Distance, duration: ScreenEntrance.Milliseconds }}>
				{@render children()}
			</div>
		{/key}
	</main>
	{#if hasChrome}
		<BottomTabBar {pathname} />
	{/if}
</div>
