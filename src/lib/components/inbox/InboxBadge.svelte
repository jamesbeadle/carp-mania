<script lang="ts">
	let { count }: { count: number } = $props();

	const BadgeCeiling = 99;
	const label = $derived(count > BadgeCeiling ? `${BadgeCeiling}+` : String(count));
</script>

{#if count > 0}
	<span class="inline-flex min-w-5 items-center justify-center rounded-full bg-volt-500 px-1.5 py-0.5 text-xs leading-none font-bold text-carbon-950" title="{count} unread">{label}</span>
{/if}
