<script lang="ts">
	import { isTabCurrent, MainTabs } from '$lib/game/navigation/mainTabs';
	import TabGlyph from './TabGlyph.svelte';

	let { pathname }: { pathname: string } = $props();
</script>

<nav class="tab-bar sticky bottom-0 z-30 grid grid-cols-5 border-t border-carbon-700 bg-carbon-950/92 backdrop-blur lg:hidden" aria-label="Main" data-sveltekit-preload-data="tap">
	{#each MainTabs as tab (tab.id)}
		{@const isCurrent = isTabCurrent(tab, pathname)}
		<a
			href={tab.href}
			class="flex flex-col items-center gap-0.5 py-2 font-display text-[11px] font-bold tracking-wide uppercase transition active:scale-95"
			class:text-volt-400={isCurrent}
			class:text-mist-400={!isCurrent}
			aria-current={isCurrent ? 'page' : undefined}
		>
			<span class="rounded-full px-3 py-0.5 transition" class:bg-volt-500-15={isCurrent}><TabGlyph kind={tab.id} /></span>
			{tab.label}
		</a>
	{/each}
</nav>

<style>
	.tab-bar {
		padding-bottom: env(safe-area-inset-bottom);
	}
	.bg-volt-500-15 {
		background: rgba(62, 232, 58, 0.15);
	}
</style>
