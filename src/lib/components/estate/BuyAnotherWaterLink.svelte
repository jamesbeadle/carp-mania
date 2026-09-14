<script lang="ts">
	let { refusal }: { refusal: string | null } = $props();

	const BuyAnotherPath = '/setup?another=1';
</script>

{#if refusal === null}
	<a href={BuyAnotherPath} class="rounded-full border border-dashed border-surge-500/70 px-3 py-1 font-display text-sm font-bold tracking-wide text-surge-400 uppercase transition hover:bg-surge-500/10 active:scale-95">+ Buy another water</a>
{:else}
	<span class="text-xs text-mist-400">{refusal}</span>
{/if}
