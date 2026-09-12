<script lang="ts">
	import { isTabCurrent, MainTabs } from '$lib/game/navigation/mainTabs';
	import TabGlyph from './TabGlyph.svelte';

	let { pathname }: { pathname: string } = $props();
</script>

<nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
	{#each MainTabs as tab (tab.id)}
		{@const isCurrent = isTabCurrent(tab, pathname)}
		<a
			href={tab.href}
			class="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-base font-bold tracking-wide uppercase transition hover:text-volt-300 active:scale-95"
			class:bg-volt-500={isCurrent}
			class:text-carbon-950={isCurrent}
			class:hover:text-carbon-950={isCurrent}
			class:text-mist-200={!isCurrent}
			aria-current={isCurrent ? 'page' : undefined}
		>
			<TabGlyph kind={tab.id} size={18} />
			{tab.label}
		</a>
	{/each}
</nav>
