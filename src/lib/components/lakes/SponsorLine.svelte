<script lang="ts">
	import { sponsorOnTheBoards } from '$lib/domain/sponsorship/lakeSponsorship';
	import { BrandCatalogue } from '$lib/domain/tackle/brands';
	import type { Lake } from '$lib/domain/types';

	let { lake, now }: { lake: Pick<Lake, 'sponsor_brand' | 'sponsored_until'>; now: Date } = $props();

	const sponsor = $derived(sponsorOnTheBoards(lake, now));
</script>

{#if sponsor}
	<p class="inline-flex items-center gap-1.5 rounded-full border border-warning-500/40 bg-warning-500/10 px-2.5 py-0.5 text-xs text-warning-500"><span aria-hidden="true">▣</span> Sponsored by {BrandCatalogue[sponsor].label}</p>
{/if}
