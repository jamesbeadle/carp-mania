<script lang="ts">
	let { avatarUrl, name, isLarge = false }: { avatarUrl: string | null; name: string; isLarge?: boolean } = $props();

	const NoInitial = '?';

	const initial = $derived(name.trim().charAt(0).toUpperCase() || NoInitial);
	const size = $derived(isLarge ? 'h-16 w-16 text-3xl' : 'h-10 w-10 text-lg');
</script>

{#if avatarUrl}
	<img src={avatarUrl} alt="" class="{size} shrink-0 rounded-full border border-volt-500/60 object-cover" referrerpolicy="no-referrer" />
{:else}
	<span class="{size} flex shrink-0 items-center justify-center rounded-full border border-volt-500/60 bg-carbon-900 font-display font-bold text-volt-300 italic" aria-hidden="true">{initial}</span>
{/if}
